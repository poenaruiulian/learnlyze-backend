import { Injectable } from '@nestjs/common';
import { CourseGenerationDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, Step } from './entities';
import { generateCourse } from './helpers';
import { ResourceService } from '../resources';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private courseRepository: Repository<Course>,
    @InjectRepository(Step) private stepRepository: Repository<Step>,
  ) {}

  async generateCourse(
    courseGenerationDto: CourseGenerationDto,
    resourceService: ResourceService,
  ) {
    await generateCourse(courseGenerationDto.description, resourceService);
  }
}
