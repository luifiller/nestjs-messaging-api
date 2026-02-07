import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { UserService } from '../user/user.service';
import { LocalStrategy } from './strategies/local/local.strategy';
import { JwtStrategy } from './strategies/jwt/jwt.strategy';
import { JwtKeyProvider } from './utils/jwt-key-provider';
import { AuthConfig } from './constant/auth.const';

/**
 * Authentication Module
 *
 * @description
 * Provides authentication and authorization functionality for the application.
 * Configures JWT-based authentication using RS256 asymmetric encryption algorithm
 * with RSA key pairs for signing and verifying tokens.
 *
 * @responsibilities
 * - JWT token generation and validation
 * - User authentication services
 * - RSA key management for token signing
 * - Authentication endpoints via AuthController
 *
 * @security
 * - Uses RS256 algorithm for enhanced security
 * - Loads RSA private/public keys from file system
 * - Validates key existence before application startup
 *
 * @exports
 * - AuthService: Available for use in other modules
 *
 * @requires
 * - JWT_PRIVATE_KEY_PATH environment variable pointing to RSA private key file
 * - JWT_PUBLIC_KEY_PATH environment variable pointing to RSA public key file
 * - JWT_EXPIRES_IN environment variable for token expiration (default: 3600 seconds)
 */
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtKeyProvider = new JwtKeyProvider(configService);
        const publicKey = jwtKeyProvider.getPublicKey();
        const privateKey = jwtKeyProvider.getPrivateKey();

        if (!privateKey || !publicKey) {
          throw new Error(AuthConfig.EXCEPTION_MESSAGES.JWT_KEYS_NOT_DEFINED);
        }

        const expiresInConfig = configService.get<string>(
          AuthConfig.ENV.JWT_EXPIRES_IN,
          AuthConfig.JWT.EXPIRE_TIME,
        );
        const expiresIn = parseInt(expiresInConfig, 10);

        return {
          privateKey,
          publicKey,
          signOptions: {
            algorithm: AuthConfig.JWT.ALGORITHM_RS256,
            issuer: AuthConfig.JWT.ISSUER,
            audience: AuthConfig.JWT.AUDIENCE,
            expiresIn,
          },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    UserService,
    LocalStrategy,
    JwtStrategy,
    JwtKeyProvider,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
