const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  CreateTableCommand,
  ListTablesCommand,
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
  console.log('Executing create tables script...\n');

  const messagesTable = {
    TableName: process.env.DYNAMODB_TABLE_MESSAGES || 'messages',
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'N' },
      { AttributeName: 'sender', AttributeType: 'S' },
      { AttributeName: 'entity', AttributeType: 'S' },
    ],
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    GlobalSecondaryIndexes: [
      {
        // Search messages by sender
        IndexName: 'GSI_SenderMessages',
        KeySchema: [
          { AttributeName: 'sender', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        // Search messages by period
        IndexName: 'GSI_CreatedAt',
        KeySchema: [
          { AttributeName: 'entity', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  };

  try {
    console.log('Creating "messages" table...');
    await client.send(new CreateTableCommand(messagesTable));
    console.log('✅ "messages" table created successfully!\n');
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('⚠️  "messages" table already exists.\n');
    } else {
      console.error('❌ Error creating "messages" table:', error.message);
      throw error;
    }
  }

  // List tables
  console.log('Listing tables...');
  const listResult = await client.send(new ListTablesCommand({}));
  console.log('Tables found:', listResult.TableNames);

  console.log('\n✅ Process completed successfully!');
  console.log('\n Next steps:');
  console.log('   - Start the application');
  console.log('   - To view data in UI: npm run dynamodb:admin and access http://localhost:8001');
}

createTables().catch(console.error);
