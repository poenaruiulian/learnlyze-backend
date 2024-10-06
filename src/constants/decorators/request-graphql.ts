import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export const RequestGraphql = createParamDecorator(
  (data: unknown, context: ExecutionContext): Request =>
    GqlExecutionContext.create(context).getContext().req,
);
