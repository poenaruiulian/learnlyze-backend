import { forwardRef, Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities';
import { Resource, ResourceService } from '../resources';
import { StepsModule } from '../steps';
import { PuppeteerModule } from 'nestjs-pptr';
import { User, UsersService } from '../users';
import { CoursesResolver } from './courses.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Resource, User]),
    PuppeteerModule.forRoot({ launchOptions: { headless: true } }),
    forwardRef(() => StepsModule),
  ],
  controllers: [],
  providers: [CoursesService, CoursesResolver, ResourceService, UsersService],
  exports: [CoursesService],
})
export class CoursesModule {}
