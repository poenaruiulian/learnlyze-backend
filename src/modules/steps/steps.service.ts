import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Step } from './entities';
import { Repository } from 'typeorm';
import { CreateStepDto } from './dto';
import { CoursesService } from '../courses';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class StepsService {
  constructor(
    @InjectRepository(Step)
    private stepRepository: Repository<Step>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createStepDto: CreateStepDto) {
    const step = new Step();

    step.parentStep = createStepDto.parentStep ?? undefined;
    step.resources = createStepDto.resources;
    step.priority = createStepDto.priority;
    step.title = createStepDto.title;
    step.description = createStepDto.description;
    step.completed = false;

    return await this.stepRepository.save(step);
  }

  async findOneById(id: number) {
    return this.stepRepository.findOne({ where: { id } });
  }

  async changeStepState({
    courseId,
    stepId: id,
  }: {
    courseId: number;
    stepId: number;
  }) {
    let existingStep = await this.stepRepository.findOneBy({ id });

    if (!existingStep) {
      // TODO Handle error
      return null;
    }

    existingStep.completed = !existingStep.completed;

    return this.stepRepository.save(existingStep).then(async (updatedStep) => {
      this.eventEmitter.emit('step.changed', updatedStep);
      return updatedStep;
    });
  }
}
