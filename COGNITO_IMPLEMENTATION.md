# AWS Cognito Authentication Implementation

## ✅ Step 1: CDK Infrastructure (COMPLETED)

### What we did:
1. Added Cognito User Pool with the following configuration:
   - Self sign-up disabled (only admin creates users)
   - Email and username sign-in enabled
   - Email auto-verification
   - Password policy: min 8 chars, requires uppercase, lowercase, and digits
   - Token validity: 1 hour for access/id tokens, 30 days for refresh token

2. Created Cognito User Pool Client for web application

3. Added Cognito Authorizer to API Gateway

4. Protected admin routes with Cognito authentication:
   - **Protected (requires JWT token):**
     - POST /barbers (create barber)
     - PUT /barbers/{barberId} (update barber)
     - DELETE /barbers/{barberId} (delete barber)
     - PUT /barbers/{barberId}/appointments/{appointmentId} (update appointment)
     - DELETE /barbers/{barberId}/appointments/{appointmentId} (delete appointment)
     - POST /services (create service)
     - PUT /services/{serviceId} (update service)
     - DELETE /services/{serviceId} (delete service)
     - POST /notifications/email (send email)
   
   - **Public (no authentication):**
     - GET /barbers (list barbers)
     - GET /barbers/{barberId} (get barber)
     - GET /barbers/{barberId}/appointments (list appointments)
     - POST /barbers/{barberId}/appointments (create appointment - customers can book)
     - GET /barbers/{barberId}/appointments/{appointmentId} (get appointment)
     - GET /services (list services)
     - GET /services/{serviceId} (get service)

5. Added CloudFormation outputs for User Pool ID and Client ID

### To deploy:
```bash
cd infrastructure
npm run build
cdk deploy
```

After deployment, note the outputs:
- `UserPoolId`
- `UserPoolClientId`
- `ApiUrl`

---

## 📋 Step 2: Create Admin User in AWS Console (NEXT)

### Instructions:
1. Go to AWS Console → Cognito → User Pools
2. Select "barbershop-user-pool"
3. Click "Create user"
4. Fill in:
   - Username: `admin` (or your preferred username)
   - Email: your email address
   - Temporary password: Create a strong password
   - Uncheck "Send an email invitation"
   - Check "Mark email as verified"
5. Click "Create user"

### First login (to change temporary password):
You'll need to use AWS CLI or the frontend app to change the temporary password on first login.

---

## 🔄 Step 3: Update Frontend (TODO)

### Install dependencies:
```bash
cd frontend
npm install aws-amplify @aws-amplify/ui-react
```

### Files to update:
1. `frontend/src/config/aws-config.ts` - Create Amplify configuration
2. `frontend/src/contexts/AuthContext.tsx` - Update to use Cognito
3. `frontend/src/services/api.ts` - Add JWT token to requests
4. `frontend/src/pages/LoginPage.tsx` - Update login flow

---

## 🧪 Step 4: Testing (TODO)

### Test authentication:
1. Login with admin user
2. Verify JWT token is stored
3. Test protected routes (should work with token)
4. Test public routes (should work without token)
5. Test token refresh
6. Test logout

---

## 🗑️ Step 5: Cleanup (TODO)

### Remove old authentication:
1. Delete `backend/lambda-ts/src/auth/login.ts`
2. Delete `UsersTable` from DynamoDB (if not needed)
3. Remove login Lambda function from CDK stack

---

## 📝 Notes

- The old `/auth/login` endpoint has been removed
- Cognito handles all authentication
- JWT tokens are validated by API Gateway automatically
- No need to write authentication logic in Lambda functions
- Tokens expire after 1 hour (configurable)
- Refresh tokens valid for 30 days
