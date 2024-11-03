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
