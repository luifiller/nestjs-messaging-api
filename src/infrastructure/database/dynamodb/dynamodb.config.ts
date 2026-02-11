import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { DynamoDBConfig } from './dynamodb-config.interface';

/**
 * Creates and configures a DynamoDB Document Client based on the provided configuration
 *
 * @description
 * This factory function creates a DynamoDB Document Client with automatic type conversion
 * between JavaScript and DynamoDB data types.
 *
 * The function supports both production (using IAM roles) and local development configurations
 * (using explicit credentials and custom endpoints).
 *
 * @param config - Configuration object containing region, optional endpoint, and optional credentials
 * @param config.region - AWS region where DynamoDB service is located
 * @param config.endpoint - Optional custom endpoint for local DynamoDB instances (e.g., DynamoDB Local)
 * @param config.credentials - Optional explicit AWS credentials (accessKeyId and secretAccessKey)
 *
 * @returns Configured DynamoDB Document Client instance with custom marshall/unmarshall options
 */
export const createDynamoDBClient = (
  config: DynamoDBConfig,
): DynamoDBDocumentClient => {
  const clientConfig: any = {
    region: config.region,
  };

  // Add custom endpoint if provided (for DynamoDB Local)
  if (config.endpoint) {
    clientConfig.endpoint = config.endpoint;
  }

  // Add explicit credentials if provided (not recommended for production with IAM Roles)
  if (config.credentials) {
    clientConfig.credentials = config.credentials;
  }

  const client = new DynamoDBClient(clientConfig);

  // DynamoDBDocumentClient is a wrapper that simplifies operations
  // Automatically converts between JavaScript types and DynamoDB types
  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      // Convert undefined to null
      convertEmptyValues: false,
      // Remove undefined values
      removeUndefinedValues: true,
      // Convert class instances to objects
      convertClassInstanceToMap: true,
    },
    unmarshallOptions: {
      // Keep numbers as Number (not Decimal)
      wrapNumbers: false,
    },
  });
};
