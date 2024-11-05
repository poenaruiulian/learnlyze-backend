import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Step } from './entities';
import { StepsService } from './steps.service';

@Module({
  imports: [TypeOrmModule.forFeature([Step])],
  controllers: [],
  providers: [StepsService],
  exports: [StepsService],
})
export class StepsModule {}
