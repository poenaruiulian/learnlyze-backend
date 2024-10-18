import { HttpException, HttpStatus } from '@nestjs/common';

export const ErrorMessages = {
  userNotFound: 'User not found',
  incorrectPassword: 'Incorrect password',
  emailAlreadyInUse: 'This email is already in use',
  somethingWentWrong: 'Something went wrong',
};

export const ErrorDescriptions = {
  userNotFound: 'Please check you credentials and try again.',
  incorrectPassword: 'The password you entered is incorrect. Please try again.',
  emailAlreadyInUse: 'Please try again with another email.',
  somethingWentWrong: '',
};

export enum ErrorCodes {
  userNotFound = 'USER_NOT_FOUND',
  incorrectPassword = 'INCORRECT_PASSWORD',
  emailAlreadyInUse = 'EMAIL_ALREADY_IN_USE',
  couldNotBeSaved = 'COULD_NOT_BE_SAVED',
}

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
