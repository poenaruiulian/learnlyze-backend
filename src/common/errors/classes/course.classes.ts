import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes, ErrorDescriptions, ErrorMessages } from '../enums';

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

export class CoursesNotFoundException extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.coursesNotFound,
        description: ErrorDescriptions.somethingWentWrong,
        code: ErrorCodes.coursesNotFound,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class AlreadyPublishedException extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.alreadyPublished,
        description: ErrorDescriptions.alreadyPublished,
        code: ErrorCodes.alreadyPublished,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class CantPublishException extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.cantPublish,
        description: ErrorDescriptions.cantPublish,
        code: ErrorCodes.cantPublish,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class CantEnrollException extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.cantEnroll,
        description: ErrorDescriptions.cantEnroll,
        code: ErrorCodes.cantEnroll,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
