import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes, ErrorDescriptions, ErrorMessages } from '../enums';

export class DefaultError extends HttpException {
  constructor(code: ErrorCodes) {
    super(
      {
        message: ErrorMessages.somethingWentWrong,
        description: ErrorDescriptions.somethingWentWrong,
        code,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export * from './auth.classes';
export * from './course.classes';
export * from './step.classes';
export * from './resource.classes';
