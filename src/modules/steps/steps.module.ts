import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Step } from './entities';
import { StepsService } from './steps.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Resource, ResourceService, ResourcesModule } from '../resources';
import { PuppeteerModule } from 'nestjs-pptr';
import { CoursesModule } from '../courses';
import { StepsResolver } from './steps.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Step]),
    EventEmitterModule.forRoot(),
    PuppeteerModule.forRoot({ launchOptions: { headless: true } }),
    forwardRef(() => ResourcesModule),
    forwardRef(() => CoursesModule),
  ],
  controllers: [],
  providers: [StepsService, StepsResolver],
  exports: [StepsService],
})
export class StepsModule {}
