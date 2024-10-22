import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Step } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Step])],
  controllers: [],
  providers: [],
  exports: [],
})
export class StepsModule {}
