const { CloudFormationClient, DescribeStacksCommand } = require('@aws-sdk/client-cloudformation');
const fs = require('fs');
const path = require('path');

async function updateFrontendEnv() {
  const client = new CloudFormationClient({ region: process.env.AWS_REGION || 'sa-east-1' });
  
  try {
    const command = new DescribeStacksCommand({ StackName: 'BarbershopStack' });
    const response = await client.send(command);
    
    const stack = response.Stacks[0];
    const apiUrl = stack.Outputs.find(output => output.OutputKey === 'ApiUrl')?.OutputValue;
    const userPoolId = stack.Outputs.find(output => output.OutputKey === 'UserPoolId')?.OutputValue;
    const userPoolClientId = stack.Outputs.find(output => output.OutputKey === 'UserPoolClientId')?.OutputValue;
    
    if (!apiUrl) {
      console.error('❌ API URL not found in stack outputs');
      return;
    }
    
    if (!userPoolId || !userPoolClientId) {
      console.error('❌ Cognito configuration not found in stack outputs');
      return;
    }
    
    const envPath = path.join(__dirname, '../../frontend/.env');
    const envContent = `# Production API
REACT_APP_API_URL=${apiUrl}

# Cognito Configuration
REACT_APP_USER_POOL_ID=${userPoolId}
REACT_APP_USER_POOL_CLIENT_ID=${userPoolClientId}
REACT_APP_AWS_REGION=${process.env.AWS_REGION || 'sa-east-1'}

# Local development mock server
# REACT_APP_API_URL=http://localhost:3001
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Frontend .env updated with:');
    console.log('   - API URL:', apiUrl);
    console.log('   - User Pool ID:', userPoolId);
    console.log('   - User Pool Client ID:', userPoolClientId);
  } catch (error) {
    console.error('❌ Error updating frontend env:', error);
  }
}

updateFrontendEnv();
