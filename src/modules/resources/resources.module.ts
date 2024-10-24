import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities';
import { ResourceService } from './resources.service';
import { PuppeteerCore, PuppeteerModule } from 'nestjs-pptr';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resource]),
    PuppeteerModule.forRoot({ launchOptions: { headless: true } }),
    PuppeteerCore,
  ],
  controllers: [],
  providers: [ResourceService, PuppeteerCore],
  exports: [ResourceService, PuppeteerCore],
})
export class ResourcesModule {}
