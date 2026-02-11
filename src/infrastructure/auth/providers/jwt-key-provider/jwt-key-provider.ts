import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { AuthConfig } from '../../../config/auth/auth.const';

/**
 * JWT Key Provider
 *
 * @description
 * Provides secure access to RSA public and private keys used for JWT token
 * signing and verification. Implements caching to avoid redundant file system
 * reads after initial key loading.
 *
 * @responsibilities
 * - Load RSA public key from file system
 * - Load RSA private key from file system
 * - Cache keys in memory for performance
 * - Validate key file existence and readability
 *
 * @performance
 * Keys are loaded once and cached in memory. Subsequent calls return the cached
 * value without file system access.
 *
 * @security
 * - Keys are read from paths specified in environment variables
 * - File existence is validated before reading
 * - Errors include file paths for debugging but don't expose key content
 */
@Injectable()
export class JwtKeyProvider {
  private publicKeyCache: string | null = null;
  private privateKeyCache: string | null = null;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Retrieves the RSA public key used for JWT token verification
   *
   * @returns {string} The RSA public key in PEM format
   * @throws {Error} If the public key file path is not configured
   * @throws {Error} If the public key file does not exist
   * @throws {Error} If the public key file cannot be read
   *
   * @description
   * Loads the public key from the file system on first call and caches it.
   * Subsequent calls return the cached value for improved performance.
   * The file path is obtained from the JWT_PUBLIC_KEY_PATH environment variable.
   */
  getPublicKey(): string {
    if (this.publicKeyCache) {
      return this.publicKeyCache;
    }

    this.publicKeyCache = this.loadKey(
      AuthConfig.ENV.JWT_PUBLIC_KEY_PATH,
      AuthConfig.EXCEPTION_MESSAGES.JWT_PUBLIC_KEY_NOT_FOUND,
    );

    return this.publicKeyCache;
  }

  /**
   * Retrieves the RSA private key used for JWT token signing
   *
   * @returns {string} The RSA private key in PEM format
   * @throws {Error} If the private key file path is not configured
   * @throws {Error} If the private key file does not exist
   * @throws {Error} If the private key file cannot be read
   *
   * @description
   * Loads the private key from the file system on first call and caches it.
   * Subsequent calls return the cached value for improved performance.
   * The file path is obtained from the JWT_PRIVATE_KEY_PATH environment variable.
   *
   * @security
   * The private key is sensitive and should be kept secure. Ensure proper
   * file permissions and never expose this key in logs or responses.
   */
  getPrivateKey(): string {
    if (this.privateKeyCache) {
      return this.privateKeyCache;
    }

    this.privateKeyCache = this.loadKey(
      AuthConfig.ENV.JWT_PRIVATE_KEY_PATH,
      AuthConfig.EXCEPTION_MESSAGES.JWT_PRIVATE_KEY_NOT_FOUND,
    );

    return this.privateKeyCache;
  }

  /**
   * Internal method to load a key from the file system
   *
   * @private
   * @param {string} configKey - The configuration key for the key file path
   * @param {string} notFoundMessage - Error message if the file doesn't exist
   * @returns {string} The key content read from the file
   * @throws {Error} If the key file path is not configured
   * @throws {Error} If the key file does not exist
   * @throws {Error} If the key file cannot be read
   *
   * @description
   * Common logic for loading both public and private keys. Validates file
   * existence and handles read errors with descriptive error messages.
   */
  private loadKey(configKey: string, notFoundMessage: string): string {
    const keyPath = this.configService.getOrThrow<string>(configKey);
    const keyFullPath = join(process.cwd(), keyPath);

    if (!existsSync(keyFullPath)) {
      throw new InternalServerErrorException(
        `${notFoundMessage} ${keyFullPath}`,
      );
    }

    try {
      return readFileSync(keyFullPath, AuthConfig.ENV.UTF8_ENCODING);
    } catch (error) {
      throw new InternalServerErrorException(
        `${AuthConfig.EXCEPTION_MESSAGES.JWT_KEY_READ_FILE_ERROR} ${error.message}`,
      );
    }
  }
}
