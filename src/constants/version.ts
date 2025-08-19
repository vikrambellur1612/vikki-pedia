export const APP_VERSION = '2.0.0';
export const APP_NAME = 'Vikki-Pedia';
export const BUILD_DATE = new Date().toISOString();

export const VERSION_INFO = {
  version: APP_VERSION,
  name: APP_NAME,
  buildDate: BUILD_DATE,
  description: 'Personal Blog & Memories - Header image and favicon integration'
} as const;
