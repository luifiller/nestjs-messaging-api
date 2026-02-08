const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
  CreateTableCommand,
  ListTablesCommand 
} = require('@aws-sdk/client-dynamodb');

const config = {
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.AWS_DYNAMODB_ENDPOINT || 'http://localhost:8000',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
  },
};

const client = new DynamoDBClient(config);

async function createTables() {
  console.log('🚀 Criando tabelas no DynamoDB...\n');

  // Tabela de mensagens
  const messagesTable = {
    TableName: 'messages',
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'N' },
      { AttributeName: 'userId', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
      { AttributeName: 'createdAt', KeyType: 'RANGE' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI_UserMessages',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  try {
    console.log('📝 Criando tabela "messages"...');
    await client.send(new CreateTableCommand(messagesTable));
    console.log('✅ Tabela "messages" criada com sucesso!\n');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('⚠️  Tabela "messages" já existe.\n');
    } else {
      console.error('❌ Erro ao criar tabela "messages":', error.message);
      throw error;
    }
  }

  // Listar tabelas
  console.log('📋 Listando tabelas...');
  const listResult = await client.send(new ListTablesCommand({}));
  console.log('Tabelas encontradas:', listResult.TableNames);

  console.log('\n✅ Processo concluído com sucesso!');
  console.log('\n💡 Próximos passos:');
  console.log('   - Iniciar a aplicação: npm run start:dev');
  console.log('   - Visualizar dados: npm run dynamodb:admin');
  console.log('   - Acessar http://localhost:8001 para UI visual\n');
}

createTables().catch(console.error);
