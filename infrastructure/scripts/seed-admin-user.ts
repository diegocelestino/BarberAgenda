import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });

async function seedAdminUser() {
  const usersTableName = process.env.USERS_TABLE_NAME;

  if (!usersTableName) {
    console.error('USERS_TABLE_NAME environment variable is required');
    process.exit(1);
  }

  const adminUser = {
    username: { S: 'admin' },
    password: { S: 'admin' }, // In production, this should be hashed
    email: { S: 'admin@barbershop.com' },
    role: { S: 'admin' },
    createdAt: { N: Date.now().toString() },
  };

  try {
    await dynamodb.send(
      new PutItemCommand({
        TableName: usersTableName,
        Item: adminUser,
      })
    );
    console.log('✅ Admin user created successfully');
    console.log('   Username: admin');
    console.log('   Password: admin');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

seedAdminUser();
