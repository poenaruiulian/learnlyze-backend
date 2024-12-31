import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes, ErrorDescriptions, ErrorMessages } from './enums';

export class UserNotFoundException extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.userNotFound,
        description: ErrorDescriptions.userNotFound,
        code: ErrorCodes.userNotFound,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class IncorrectPassword extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.incorrectPassword,
        description: ErrorDescriptions.incorrectPassword,
        code: ErrorCodes.incorrectPassword,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class EmailAlreadyInUse extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.emailAlreadyInUse,
        description: ErrorDescriptions.emailAlreadyInUse,
        code: ErrorCodes.emailAlreadyInUse,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class FirstFormOfTheCourseFailed extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.somethingWentWrong,
        description: ErrorDescriptions.firstFormOfTheCourseFailed,
        code: ErrorCodes.courseGenerationFailed,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class SecondFormOfTheCourseFailed extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.somethingWentWrong,
        description: ErrorDescriptions.secondFormOfTheCourseFailed,
        code: ErrorCodes.courseGenerationFailed,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class LastFormOfTheCourseFailed extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.somethingWentWrong,
        description: ErrorDescriptions.lastFormOfTheCourseFailed,
        code: ErrorCodes.courseGenerationFailed,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class CourseNotFoundException extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.courseNotFound,
        description: ErrorDescriptions.somethingWentWrong,
        code: ErrorCodes.courseNotFound,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class StepNotFoundException extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.stepNotFound,
        description: ErrorDescriptions.somethingWentWrong,
        code: ErrorCodes.stepNotFound,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

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
