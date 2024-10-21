import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities';
import { ResourceService } from './resources.service';

@Module({
  imports: [TypeOrmModule.forFeature([Resource])],
  controllers: [],
  providers: [ResourceService],
  exports: [ResourceService],
})
export class ResourcesModule {}
