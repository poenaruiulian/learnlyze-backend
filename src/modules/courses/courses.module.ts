import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, Step } from './entities';
import { CoursesResolver } from './graphql';
import { Resource, ResourceService } from '../resources';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Step, Resource])],
  controllers: [],
  providers: [CoursesService, CoursesResolver, ResourceService],
  exports: [CoursesService],
})
export class CoursesModule {}
