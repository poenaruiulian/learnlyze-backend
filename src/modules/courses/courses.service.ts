import { Injectable } from '@nestjs/common';
import { CourseGenerationDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, Resource, Step } from './entities';
import { generateCourse } from './helpers';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private courseRepository: Repository<Course>,
    @InjectRepository(Step) private stepRepository: Repository<Step>,
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
  ) {}

  async generateCourse(courseGenerationDto: CourseGenerationDto) {
    await generateCourse(courseGenerationDto.description);
  }
}
