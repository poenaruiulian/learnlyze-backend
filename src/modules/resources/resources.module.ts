import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities';
import { ResourceService } from './resources.service';
import { PuppeteerCore, PuppeteerModule } from 'nestjs-pptr';
import { StepsModule } from '../steps';
import { ResourcesResolver } from './resources.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resource]),
    PuppeteerModule.forRoot({ launchOptions: { headless: true } }),
    PuppeteerCore,
    forwardRef(() => StepsModule),
  ],
  controllers: [],
  providers: [ResourceService, PuppeteerCore, ResourcesResolver],
  exports: [ResourceService, PuppeteerCore],
})
export class ResourcesModule {}
