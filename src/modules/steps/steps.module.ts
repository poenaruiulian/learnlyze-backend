import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Step } from './entities';
import { StepsService } from './steps.service';
import { StepsResolver } from './graphql';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Resource, ResourceService } from '../resources';
import { PuppeteerModule } from 'nestjs-pptr';

@Module({
  imports: [
    TypeOrmModule.forFeature([Step, Resource]),
    EventEmitterModule.forRoot(),
    PuppeteerModule.forRoot({ launchOptions: { headless: true } }),
  ],
  controllers: [],
  providers: [StepsService, StepsResolver, ResourceService],
  exports: [StepsService],
})
export class StepsModule {}
