import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, Resource, Step } from './entities';
import { CoursesResolver } from './graphql';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Step, Resource])],
  controllers: [],
  providers: [CoursesService, CoursesResolver],
  exports: [CoursesService],
})
export class CoursesModule {}
