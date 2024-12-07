import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  AuthModule,
  UsersModule,
  CoursesModule,
  ResourcesModule,
  StepsModule,
} from './modules';
import * as dotenv from 'dotenv';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DatabaseModule } from './config';
import { AuthGuard } from './common';
import { PuppeteerModule } from 'nestjs-pptr';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
    }),
    PuppeteerModule.forRoot({ launchOptions: { headless: true } }),
    DatabaseModule,
    UsersModule,
    ResourcesModule,
    CoursesModule,
    AuthModule,
    StepsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
