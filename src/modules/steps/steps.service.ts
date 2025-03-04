import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Step } from './entities';
import { Repository } from 'typeorm';
import { CreateStepDto } from './dto';
import { CoursesService } from '../courses';
import {
  DescriptionFailedException,
  ErrorDescriptions,
  handleOpenAIRequests,
  Logger,
  SecondFormStepsFailedException,
  StepGenerationExceededException,
  StepGenerationFailedException,
  StepHasChildException,
  StepNotFoundException,
} from '../../common';
import { generateSubSteps } from './helpers';
import { generateSecondFormSteps } from '../courses/helpers/courseGeneration';
import { ResourceService } from '../resources';

@Injectable()
export class StepsService {
  constructor(
    @InjectRepository(Step)
    private stepRepository: Repository<Step>,
    @Inject(forwardRef(() => ResourceService))
    private resourceService: ResourceService,
    @Inject(forwardRef(() => CoursesService))
    private courseService: CoursesService,
  ) {}

  async create(createStepDto: CreateStepDto) {
    const step = new Step();

    step.parentStep = createStepDto.parentStep ?? undefined;
    step.resources = createStepDto.resources;
    step.priority = createStepDto.priority;
    step.title = createStepDto.title;
    step.description = createStepDto.description;
    step.completed = false;
    step.generation = createStepDto.generation;

    return await this.stepRepository.save(step);
  }

  async findOneById(id: number) {
    return this.stepRepository.findOne({ where: { id } });
  }

  async findByParentId(parentStep: number) {
    return this.stepRepository.findBy({ parentStep });
  }

  async save(step: Step) {
    return this.stepRepository.save(step);
  }

  async changeStateSubSteps(subSteps: Step[], parentStep: Step) {
    for (let subStep of subSteps) {
      const subStepsOfSubStep = await this.stepRepository.findBy({
        parentStep: subStep.id,
      });

      subStep.completed = parentStep.completed;

      await this.stepRepository.save(subStep);

      await this.changeStateSubSteps(subStepsOfSubStep, subStep);
    }
  }

  async changeStateOfParent(step: Step, courseId: number) {
    // Save all the sub-steps of a step
    const subSteps = await this.stepRepository.findBy({
      parentStep: step.parentStep,
    });

    // Check if all the found sub-steps of a step are completed
    const areSubStepsCompleted = subSteps
      .map((step) => step.completed)
      .reduce((previousValue, currentValue) => previousValue && currentValue);

    let parentStep = await this.stepRepository.findOneBy({
      id: step.parentStep,
    });

    // If the step completion state differs from the one calculated above
    // we change its state and also change the number of completed steps of the course
    if (parentStep && parentStep.completed !== areSubStepsCompleted) {
      parentStep.completed = areSubStepsCompleted;

      await this.save(parentStep).then(async (updatedStep) => {
        await this.courseService.changeCompletedSteps({
          courseId,
          completed: areSubStepsCompleted,
        });
      });
    }
  }

  async changeCompletionState({
    stepId: id,
    courseId,
  }: {
    stepId: number;
    courseId: number;
  }) {
    let existingStep = await this.stepRepository.findOneBy({ id });

    if (!existingStep) {
      throw new StepNotFoundException();
    }

    const subSteps = await this.stepRepository.findBy({ parentStep: id });

    existingStep.completed = !existingStep.completed;

    const updatedStep = await this.stepRepository.save(existingStep);

    // If a step is completed every sub-step under it should be completed as well
    await this.changeStateSubSteps(subSteps, existingStep);

    // If a step is completed there is a possibility that the step represents a sub-step of another step
    // In that case, we would want to change the state of the parent step too if all the sub-steps are completed
    if (updatedStep.parentStep) {
      await this.changeStateOfParent(updatedStep, courseId);
    }

    // If the step is not a sub-step, we want to change the total number of completed steps of a course
    if (!updatedStep.parentStep) {
      await this.courseService.changeCompletedSteps({
        courseId,
        completed: updatedStep.completed,
      });
    }

    return updatedStep;
  }

  async break({ stepId: id, feedback }: { stepId: number; feedback: string }) {
    const foundStep = await this.stepRepository.findOneBy({ id });

    if (!foundStep) {
      throw new StepNotFoundException();
    }

    // The generation of a step is defined by how many parent step are above the current step
    // This precaution method was created to avoid the possibility of
    // an infinite number of sub-steps
    if (foundStep.generation === 2) {
      Logger.error(ErrorDescriptions.stepGenerationExceeded);
      throw new StepGenerationExceededException();
    }

    // A step has a child if a set of sub-steps with the
    // parentId of the current step already exist
    if (foundStep.hasChild) {
      Logger.error(ErrorDescriptions.stepHasChild);
      throw new StepHasChildException();
    }

    // Generate the structure of the steps (which are essentially basic steps but with more context)
    const generatedSubSteps = await generateSubSteps({
      title: foundStep.title,
      description: foundStep.description,
      feedback,
    });

    if (!generatedSubSteps) {
      Logger.error(ErrorDescriptions.stepsGenerationFailed);
      throw new StepGenerationFailedException();
    }

    // The second form a group of steps represents the initial set
    // but with the resources fetched (YoutubeAPI/Scrapper/Local)
    const secondFormGeneratedSteps = await generateSecondFormSteps(
      generatedSubSteps,
      this.resourceService,
    );

    if (!secondFormGeneratedSteps) {
      Logger.error(ErrorDescriptions.stepsSecondFormGenerationFailed);
      throw new SecondFormStepsFailedException();
    }

    let insertedSteps: Step[] = [];

    // For each step we want to generate a suitable description using OpenAI
    for (const step of secondFormGeneratedSteps) {
      let descriptions = await handleOpenAIRequests({
        description: step.title,
        type: 'generateDescriptionTitleBased',
      });

      descriptions = descriptions ? JSON.parse(descriptions) : descriptions;

      // If the description failed to parse, meaning the response was not satisfied
      // we retry the process one more time before throwing an error
      if (!descriptions) {
        descriptions = await handleOpenAIRequests({
          description: step.title,
          type: 'generateDescriptionTitleBased',
        });

        descriptions = descriptions ? JSON.parse(descriptions) : descriptions;

        if (!descriptions) {
          Logger.error(ErrorDescriptions.descriptionFailedToGenerate);
          throw new DescriptionFailedException();
        }
      }

      // And also, for each step we want to create the list of resources available
      // These resources are found through the external string, this string being
      // available in the second form of the generated steps.
      const resourcesIds: number[] = [];

      for (const resource of step.resources) {
        const response = await this.resourceService.findOneByExternal(
          resource.external,
        );
        if (
          response &&
          !resourcesIds.includes(response.id) &&
          resourcesIds.length <= 5
        ) {
          resourcesIds.push(response.id);
        }
      }

      await this.create({
        parentStep: id,
        description: descriptions[0],
        priority: step.number,
        title: step.title,
        resources: resourcesIds,
        generation: foundStep.generation + 1,
      }).then((insertedStep) => insertedSteps.push(insertedStep));
    }

    foundStep.hasChild = true;
    await this.stepRepository.save(foundStep);

    return insertedSteps;
  }
}
