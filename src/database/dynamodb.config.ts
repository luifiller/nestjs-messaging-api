import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export interface DynamoDBConfig {
  region: string;
  endpoint?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

/**
 * Cria e configura o cliente DynamoDB baseado no ambiente
 */
export const createDynamoDBClient = (config: DynamoDBConfig): DynamoDBDocumentClient => {
  const clientConfig: any = {
    region: config.region,
  };

  // Se endpoint customizado (DynamoDB Local), adiciona
  if (config.endpoint) {
    clientConfig.endpoint = config.endpoint;
  }

  // Se credenciais explícitas (não recomendado para produção com IAM Roles)
  if (config.credentials) {
    clientConfig.credentials = config.credentials;
  }

  const client = new DynamoDBClient(clientConfig);

  // DynamoDBDocumentClient é um wrapper que facilita operações
  // Converte automaticamente tipos JavaScript <-> DynamoDB
  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      // Converte undefined para null
      convertEmptyValues: false,
      // Remove valores undefined
      removeUndefinedValues: true,
      // Converte classes para objetos
      convertClassInstanceToMap: true,
    },
    unmarshallOptions: {
      // Mantém números como Number (não Decimal)
      wrapNumbers: false,
    },
  });
};
