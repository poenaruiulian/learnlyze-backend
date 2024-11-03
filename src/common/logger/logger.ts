export const Logger = {
  log: (message: string) => {
    console.log(`DEV_LOG: ${message}`);
  },
  error: (message: string) => {
    console.log(`DEV_ERROR: ${message}`);
  },
  warning: (message: string) => {
    console.log(`DEV_WARNING: ${message}`);
  },
};
