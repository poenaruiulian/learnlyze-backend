import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Step } from './entities';
import { StepsService } from './steps.service';
import { StepsResolver } from './graphql';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [TypeOrmModule.forFeature([Step]), EventEmitterModule.forRoot()],
  controllers: [],
  providers: [StepsService, StepsResolver],
  exports: [StepsService],
})
export class StepsModule {}
