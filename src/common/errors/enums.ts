export const ErrorMessages = {
  // Authorization
  userNotFound: 'User not found',
  incorrectPassword: 'Incorrect password',
  emailAlreadyInUse: 'This email is already in use',
  somethingWentWrong: 'Something went wrong',
  updateError: "Couldn't update credentials",
  // Courses
  courseNotFound: 'Course not found',
  coursesNotFound: 'Courses not found',
  alreadyPublished: 'Already published',
  cantPublish: "Can't published",
  cantEnroll: "Can't enroll",
  // Steps
  stepNotFound: 'Step not found',
  stepGenerationExceeded: 'Step generation exceeded',
  stepHasChild: 'Sub-steps already created',
  stepsGenerationFailed: 'Steps generation failed',
  stepsSecondFormGenerationFailed: 'Second form generation failed',
  descriptionFailedToGenerate: 'Description failed to generate',
  stepStructureFailedToGenerate: 'Step structure failed',
  // Resources
  resourceNotFound: 'Resource not found',
  newSearchPhraseFailed: 'New search phrase failed',
  resourceGenerationFailed: 'Resource generation failed',
};

export const ErrorDescriptions = {
  // Authorization
  userNotFound: 'Please check you credentials and try again.',
  incorrectPassword: 'The password you entered is incorrect. Please try again.',
  emailAlreadyInUse: 'Please try again with another email.',
  updateError: 'Check the credentials, the may already exists',
  // Courses
  firstFormOfTheCourseFailed: 'The first form of the course failed to generate',
  secondFormOfTheCourseFailed:
    'The second form of the course failed to generate',
  lastFormOfTheCourseFailed: 'Last form of the course failed to generate',
  alreadyPublished: 'The course was already published',
  cantPublish: 'The criteria for publishing are not met.',
  cantEnroll: 'You already are enrolled or you have published it.',
  // Steps
  stepGenerationExceeded: 'The nesting of substeps is too deep.',
  stepHasChild: 'This step already has a set of sub-sets',
  descriptionFailedToGenerate: 'Description generation using OpenAI failed',
  stepStructureFailedToGenerate:
    'The structure of the steps using OpenAI failed.',
  stepsGenerationFailed: 'Steps generation failed to generate',
  stepsSecondFormGenerationFailed:
    'Second form of the steps failed to generate',
  // Resources
  newSearchPhraseFailed: 'New search phrase failed to generate',
  // Generic
  somethingWentWrong: '',
};

export enum ErrorCodes {
  // Authorization
  userNotFound = 'USER_NOT_FOUND',
  incorrectPassword = 'INCORRECT_PASSWORD',
  emailAlreadyInUse = 'EMAIL_ALREADY_IN_USE',
  updateError = 'UPDATE_ERROR',
  // Courses
  courseGenerationFailed = 'COURSE_GENERATION_FAILED',
  courseNotFound = 'COURSE_NOT_FOUND',
  coursesNotFound = 'COURSE_NOT_FOUND',
  alreadyPublished = 'ALREADY_PUBLISHED',
  cantPublish = 'CANT_PUBLISH',
  cantEnroll = 'CANT_ENROLL',
  // Steps
  stepNotFound = 'STEP_NOT_FOUND',
  stepGenerationExceeded = 'STEP_GENERATION_EXCEEDED',
  stepHasChild = 'STEP_HAS_CHIlD',
  stepsGenerationFailed = 'STEP_GENERATION_FAILED',
  stepsSecondFormGenerationFailed = 'STEP_SECOND_FORM_GENERATION_FAILED',
  descriptionFailedToGenerate = 'DESCRIPTION_FAILED_TO_GENERATE',
  stepStructureFailedToGenerate = 'STEP_STRUCTURE_FAILED',
  // Resources
  resourceNotFound = 'RESOURCE_NOT_FOUND',
  newSearchPhraseFailed = 'NEW_SEARCH_PHRASE_FAILED',
  resourceGenerationFailed = 'RESOURCE_GENERATION_FAILED',
  // Generic
  couldNotBeSaved = 'COULD_NOT_BE_SAVED',
}
