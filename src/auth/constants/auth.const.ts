export const AuthConfig = {
  JWT: {
    ALGORITHM_RS256: 'RS256',
    ISSUER: 'nestjs-messaging-api',
    AUDIENCE: 'nestjs-messaging-api-users',
    EXPIRE_TIME: '3600s',
  },

  ENV: {
    JWT_EXPIRES_IN: 'JWT_EXPIRES_IN',
    JWT_PUBLIC_KEY_PATH: 'JWT_PUBLIC_KEY_PATH',
    JWT_PRIVATE_KEY_PATH: 'JWT_PRIVATE_KEY_PATH',
    UTF8_ENCODING: 'utf8',
    ENV_FILE_NAME: '.env',
  },

  EXCEPTION_MESSAGES: {
    JWT_KEYS_NOT_DEFINED:
      'JWT_PRIVATE_KEY_PATH and JWT_PUBLIC_KEY_PATH must be defined in environment variables',
    JWT_PUBLIC_KEY_NOT_FOUND: 'Public key file not found:',
    JWT_PRIVATE_KEY_NOT_FOUND: 'Private key file not found:',
    JWT_KEY_READ_FILE_ERROR: 'Failed to read JWT key files',
  },

  API_DOC: {
    LOGIN_OPERATION_SUMMARY: 'Authenticate user and obtain access token',

    LOGIN_SUCCESS_RESPONSE: 'User authenticated successfully',
    LOGIN_UNAUTHORIZED_RESPONSE: 'Invalid credentials',
    LOGIN_TOKEN_GENERATION_FAILURE_RESPONSE: 'Failed to generate JWT token',

    UNAUTHORIZED_EXCEPTION: 'Unauthorized',
    ACCESS_TOKEN_EXAMPLE: 'some-access-token-string',
  },
} as const;
