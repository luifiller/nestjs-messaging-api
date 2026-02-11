import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { createDynamoDBClient } from './dynamodb.config';
import { DynamoDBConfig } from './dynamodb-config.interface';

jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');

describe('DynamoDB Config', () => {
  let mockDynamoDBClient: jest.Mocked<DynamoDBClient>;
  let mockDocumentClient: jest.Mocked<DynamoDBDocumentClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDynamoDBClient = {} as jest.Mocked<DynamoDBClient>;
    mockDocumentClient = {} as jest.Mocked<DynamoDBDocumentClient>;

    (DynamoDBClient as jest.Mock).mockReturnValue(mockDynamoDBClient);
    (DynamoDBDocumentClient.from as jest.Mock).mockReturnValue(
      mockDocumentClient,
    );
  });

  describe('createDynamoDBClient', () => {
    it('should create a DynamoDB client with only region', () => {
      const config: DynamoDBConfig = {
        region: 'us-east-1',
      };

      const result = createDynamoDBClient(config);

      expect(DynamoDBClient).toHaveBeenCalledWith({
        region: 'us-east-1',
      });
      expect(DynamoDBDocumentClient.from).toHaveBeenCalledWith(
        mockDynamoDBClient,
        {
          marshallOptions: {
            convertEmptyValues: false,
            removeUndefinedValues: true,
            convertClassInstanceToMap: true,
          },
          unmarshallOptions: {
            wrapNumbers: false,
          },
        },
      );
      expect(result).toBe(mockDocumentClient);
    });

    it('should create a DynamoDB client with region and custom endpoint', () => {
      const config: DynamoDBConfig = {
        region: 'us-east-1',
        endpoint: 'http://localhost:8000',
      };

      const result = createDynamoDBClient(config);

      expect(DynamoDBClient).toHaveBeenCalledWith({
        region: 'us-east-1',
        endpoint: 'http://localhost:8000',
      });
      expect(result).toBe(mockDocumentClient);
    });

    it('should create a DynamoDB client with region and explicit credentials', () => {
      const config: DynamoDBConfig = {
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
      };

      const result = createDynamoDBClient(config);

      expect(DynamoDBClient).toHaveBeenCalledWith({
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
      });
      expect(result).toBe(mockDocumentClient);
    });

    it('should create a DynamoDB client with all configuration options', () => {
      const config: DynamoDBConfig = {
        region: 'us-west-2',
        endpoint: 'http://localhost:8000',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
      };

      const result = createDynamoDBClient(config);

      expect(DynamoDBClient).toHaveBeenCalledWith({
        region: 'us-west-2',
        endpoint: 'http://localhost:8000',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
      });
      expect(DynamoDBDocumentClient.from).toHaveBeenCalledWith(
        mockDynamoDBClient,
        {
          marshallOptions: {
            convertEmptyValues: false,
            removeUndefinedValues: true,
            convertClassInstanceToMap: true,
          },
          unmarshallOptions: {
            wrapNumbers: false,
          },
        },
      );
      expect(result).toBe(mockDocumentClient);
    });

    it('should configure DynamoDB Document Client with correct marshall options', () => {
      const config: DynamoDBConfig = {
        region: 'us-east-1',
      };

      createDynamoDBClient(config);

      const documentClientCall = (DynamoDBDocumentClient.from as jest.Mock).mock
        .calls[0];
      const marshallOptions = documentClientCall[1].marshallOptions;

      expect(marshallOptions.convertEmptyValues).toBe(false);
      expect(marshallOptions.removeUndefinedValues).toBe(true);
      expect(marshallOptions.convertClassInstanceToMap).toBe(true);
    });

    it('should configure DynamoDB Document Client with correct unmarshall options', () => {
      const config: DynamoDBConfig = {
        region: 'us-east-1',
      };

      createDynamoDBClient(config);

      const documentClientCall = (DynamoDBDocumentClient.from as jest.Mock).mock
        .calls[0];
      const unmarshallOptions = documentClientCall[1].unmarshallOptions;

      expect(unmarshallOptions.wrapNumbers).toBe(false);
    });

    it('should not add endpoint to client config when not provided', () => {
      const config: DynamoDBConfig = {
        region: 'us-east-1',
      };

      createDynamoDBClient(config);

      const clientConfig = (DynamoDBClient as jest.Mock).mock.calls[0][0];
      expect(clientConfig.endpoint).toBeUndefined();
    });

    it('should not add credentials to client config when not provided', () => {
      const config: DynamoDBConfig = {
        region: 'us-east-1',
      };

      createDynamoDBClient(config);

      const clientConfig = (DynamoDBClient as jest.Mock).mock.calls[0][0];
      expect(clientConfig.credentials).toBeUndefined();
    });
  });
});
