import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes, ErrorDescriptions, ErrorMessages } from '../enums';

export class ResourceNotFoundException extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.resourceNotFound,
        description: ErrorDescriptions.somethingWentWrong,
        code: ErrorCodes.resourceNotFound,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class NewSearchPhraseFailedException extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.newSearchPhraseFailed,
        description: ErrorDescriptions.newSearchPhraseFailed,
        code: ErrorCodes.newSearchPhraseFailed,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ResourceGenerationFailedException extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.resourceGenerationFailed,
        description: ErrorDescriptions.somethingWentWrong,
        code: ErrorCodes.resourceGenerationFailed,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
