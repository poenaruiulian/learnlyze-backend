import { Injectable } from '@nestjs/common';
import { CourseGenerationDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities';
import { generateCourse } from './helpers';
import { ResourceService } from '../resources';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private courseRepository: Repository<Course>,
  ) {}

  async generateCourse(
    courseGenerationDto: CourseGenerationDto,
    resourceService: ResourceService,
  ) {
    await generateCourse(courseGenerationDto.description, resourceService);
  }
}
