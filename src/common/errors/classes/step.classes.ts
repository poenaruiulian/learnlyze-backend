import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes, ErrorDescriptions, ErrorMessages } from '../enums';

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

export class StepStructureException extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.stepStructureFailedToGenerate,
        description: ErrorDescriptions.stepStructureFailedToGenerate,
        code: ErrorCodes.stepStructureFailedToGenerate,
      },
      HttpStatus.NO_CONTENT,
    );
  }
}

export class StepGenerationFailedException extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.stepsGenerationFailed,
        description: ErrorDescriptions.stepsGenerationFailed,
        code: ErrorCodes.stepsGenerationFailed,
      },
      HttpStatus.NO_CONTENT,
    );
  }
}

export class SecondFormStepsFailedException extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.stepsSecondFormGenerationFailed,
        description: ErrorDescriptions.stepsSecondFormGenerationFailed,
        code: ErrorCodes.stepsSecondFormGenerationFailed,
      },
      HttpStatus.NO_CONTENT,
    );
  }
}

export class StepGenerationExceededException extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.stepGenerationExceeded,
        description: ErrorDescriptions.stepGenerationExceeded,
        code: ErrorCodes.stepGenerationExceeded,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class StepHasChildException extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.stepHasChild,
        description: ErrorDescriptions.stepHasChild,
        code: ErrorCodes.stepHasChild,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class DescriptionFailedException extends HttpException {
  constructor() {
    super(
      {
        message: ErrorMessages.descriptionFailedToGenerate,
        description: ErrorDescriptions.descriptionFailedToGenerate,
        code: ErrorCodes.descriptionFailedToGenerate,
      },
      HttpStatus.NO_CONTENT,
    );
  }
}
