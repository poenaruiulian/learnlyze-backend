import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Step } from './entities';
import { StepsService } from './steps.service';
import { StepsResolver } from './graphql';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Resource, ResourceService, ResourcesModule } from '../resources';
import { PuppeteerModule } from 'nestjs-pptr';

@Module({
  imports: [
    TypeOrmModule.forFeature([Step]),
    EventEmitterModule.forRoot(),
    PuppeteerModule.forRoot({ launchOptions: { headless: true } }),
    forwardRef(() => ResourcesModule),
  ],
  controllers: [],
  providers: [StepsService, StepsResolver],
  exports: [StepsService],
})
export class StepsModule {}
