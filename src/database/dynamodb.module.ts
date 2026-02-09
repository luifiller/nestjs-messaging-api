import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { createDynamoDBClient } from './dynamodb.config';

export const DYNAMODB_CLIENT = 'DYNAMODB_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DYNAMODB_CLIENT,
      useFactory: (configService: ConfigService): DynamoDBDocumentClient => {
        const region = configService.getOrThrow<string>('AWS_REGION');
        const config: any = { region };

        const endpoint = configService.getOrThrow<string>(
          'AWS_DYNAMODB_ENDPOINT',
        );
        if (endpoint) {
          config.endpoint = endpoint;
        }

        // Se tiver credenciais explícitas (local)
        const accessKeyId =
          configService.getOrThrow<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        );
        if (accessKeyId && secretAccessKey) {
          config.credentials = { accessKeyId, secretAccessKey };
        }

        return createDynamoDBClient(config);
      },
      inject: [ConfigService],
    },
  ],
  exports: [DYNAMODB_CLIENT],
})
export class DynamoDBModule {}
