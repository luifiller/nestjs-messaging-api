import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { createDynamoDBClient } from './dynamodb.config';
import { EnvVariables } from '../config/environment/env-variables.const';

/**
 * DynamoDB Module
 *
 * @description
 * Global module that provides and configures the DynamoDB Document Client for the application.
 * This module creates a singleton instance of the DynamoDB client with configuration from environment variables.
 * The client is exported globally and can be injected into any service across the application.
 *
 * @remarks
 * This is a global module, meaning it only needs to be imported once in the root module
 * and its providers will be available throughout the application.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EnvVariables.DYNAMODB.CLIENT,
      useFactory: (configService: ConfigService): DynamoDBDocumentClient => {
        const region = configService.getOrThrow<string>(
          EnvVariables.AWS.REGION,
        );
        const config: any = { region };

        const endpoint = configService.getOrThrow<string>(
          EnvVariables.AWS.DYNAMODB_ENDPOINT,
        );
        if (endpoint) {
          config.endpoint = endpoint;
        }

        const accessKeyId = configService.getOrThrow<string>(
          EnvVariables.AWS.ACCESS_KEY_ID,
        );
        const secretAccessKey = configService.getOrThrow<string>(
          EnvVariables.AWS.SECRET_ACCESS_KEY,
        );
        if (accessKeyId && secretAccessKey) {
          config.credentials = { accessKeyId, secretAccessKey };
        }

        return createDynamoDBClient(config);
      },
      inject: [ConfigService],
    },
  ],
  exports: [EnvVariables.DYNAMODB.CLIENT],
})
export class DynamoDBModule {}
