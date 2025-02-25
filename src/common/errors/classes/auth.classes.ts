import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes, ErrorDescriptions, ErrorMessages } from '../enums';

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
