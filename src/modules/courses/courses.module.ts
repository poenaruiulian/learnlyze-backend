import { forwardRef, Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities';
import { CoursesResolver } from './graphql';
import { Resource, ResourceService } from '../resources';
import { Step, StepsModule, StepsService } from '../steps';
import { PuppeteerModule } from 'nestjs-pptr';
import { User, UsersService } from '../users';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Step, Resource, User]),
    PuppeteerModule.forRoot({ launchOptions: { headless: true } }),
  ],
  controllers: [],
  providers: [
    CoursesService,
    CoursesResolver,
    ResourceService,
    StepsService,
    UsersService,
  ],
  exports: [CoursesService],
})
export class CoursesModule {}
