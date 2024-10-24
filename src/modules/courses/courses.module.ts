import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities';
import { CoursesResolver } from './graphql';
import { Resource, ResourceService } from '../resources';
import { Step } from '../steps';
import { PuppeteerModule } from 'nestjs-pptr';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Step, Resource]),
    PuppeteerModule.forRoot({ launchOptions: { headless: true } }),
  ],
  controllers: [],
  providers: [CoursesService, CoursesResolver, ResourceService],
  exports: [CoursesService],
})
export class CoursesModule {}
