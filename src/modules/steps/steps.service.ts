import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Step } from './entities';
import { Repository } from 'typeorm';
import { CreateStepDto } from './dto';
import { CoursesService } from '../courses';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  handleOpenAIRequests,
  Logger,
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
    private eventEmitter: EventEmitter2,
    private resourceService: ResourceService,
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

  async changeStepState({ stepId: id }: { stepId: number }) {
    let existingStep = await this.stepRepository.findOneBy({ id });

    if (!existingStep) {
      throw new StepNotFoundException();
    }

    existingStep.completed = !existingStep.completed;

    return this.stepRepository.save(existingStep).then(async (updatedStep) => {
      this.eventEmitter.emit('step.changed', updatedStep);
      return updatedStep;
    });
  }

  async breakStep({
    stepId: id,
    feedback,
  }: {
    stepId: number;
    feedback: string;
  }) {
    const foundStep = await this.stepRepository.findOneBy({ id });

    if (!foundStep) {
      throw new StepNotFoundException();
    }

    if (foundStep.generation === 2) {
      // TODO Handle generation error
      Logger.warning('The nesting of substeps is too deep.');
      return null;
    }

    const generatedSubSteps = await generateSubSteps({
      title: foundStep.title,
      description: foundStep.description,
      feedback,
    });

    if (!generatedSubSteps) {
      // TODO Handle error
      return null;
    }

    const secondForGeneratedSteps = await generateSecondFormSteps(
      generatedSubSteps,
      this.resourceService,
    );

    if (!secondForGeneratedSteps) {
      // TODO Handle error
      return null;
    }

    let insertedSteps: Step[] = [];

    for (const step of secondForGeneratedSteps) {
      const description = await handleOpenAIRequests({
        description: step.title,
        type: 'generateDescriptionTitleBased',
      });

      if (!description) {
        // TODO Handle error
        return null;
      }

      const resourcesIds: number[] = [];

      for (const resource of step.resources) {
        const response = await this.resourceService.findOneByExternal(
          resource.external,
        );
        if (response) {
          resourcesIds.push(response.id);
        }
      }

      await this.create({
        parentStep: id,
        description,
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
