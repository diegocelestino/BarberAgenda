# AWS Cognito Frontend Implementation

## ✅ What We've Implemented

### 1. Configuration Files
- **`frontend/src/config/aws-config.ts`**: AWS Cognito configuration with environment detection
- **`frontend/.env.production`**: Production environment variables template

### 2. Cognito Service
- **`frontend/src/services/cognitoService.ts`**: 
  - Mock authentication for development (username: admin, password: admin)
  - Real Cognito authentication for production
  - Automatic switching based on environment
  - Token management (access, id, refresh tokens)

### 3. Updated Components
- **`frontend/src/contexts/AuthContext.tsx`**: 
  - Now uses Cognito service instead of old API
  - Manages JWT tokens
  - Provides `getAccessToken()` method
  - Shows auth mode (mock vs real)

- **`frontend/src/services/api.ts`**: 
  - Automatically adds JWT token to all API requests
  - Uses `Authorization: Bearer <token>` header

- **`frontend/src/pages/LoginPage.tsx`**: 
  - Shows development mode indicator
  - Only shows demo credentials in mock mode

### 4. Deployment Script
- **`backend/scripts/update-frontend-env.js`**: 
  - Updated to inject Cognito User Pool ID and Client ID
  - Replaces placeholders in `.env.production`

---

## 🔧 How It Works

### Development Mode (Local)
When `REACT_APP_ENV=local` or Cognito is not configured:
- Uses **mock authentication**
- Credentials: `admin` / `admin`
- Generates fake JWT tokens
- No real AWS calls
- Shows "🔧 Modo de Desenvolvimento" indicator

### Production Mode
When `REACT_APP_ENV=production` AND Cognito is configured:
- Uses **real AWS Cognito**
- Authenticates against your User Pool
- Gets real JWT tokens
- Tokens automatically added to API requests
- API Gateway validates tokens

---

## 🚀 Testing Locally

### 1. Start the frontend in development mode:
```bash
cd frontend
npm start
```

### 2. Login with mock credentials:
- Username: `admin`
- Password: `admin`

### 3. Check the console:
You should see: `✅ Logged in successfully (MOCK mode)`

### 4. Test protected routes:
- Create/edit/delete barbers
- Create/edit/delete services
- Manage appointments

All requests will include the mock JWT token in the Authorization header.

---

## 🌐 Testing Against Production Cognito (Optional)

If you want to test real Cognito locally:

1. Update `frontend/.env.local`:
```env
REACT_APP_ENV=production
REACT_APP_API_URL=https://your-api-gateway-url.amazonaws.com/prod/
REACT_APP_USER_POOL_ID=sa-east-1_XXXXXXXXX
REACT_APP_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_AWS_REGION=sa-east-1
```

2. Restart the frontend:
```bash
npm start
```

3. Login with your real Cognito user credentials

---

## 📦 Production Deployment

The GitHub Actions workflow will:

1. Deploy the CDK stack (already done ✅)
2. Run `update-frontend-env.js` to inject Cognito values
3. Build the frontend with production config
4. Deploy to S3/CloudFront

The deployed app will automatically use real Cognito authentication.

---

## 🔐 Token Flow

### Login:
1. User enters credentials
2. Frontend calls Cognito `InitiateAuth`
3. Cognito returns: `accessToken`, `idToken`, `refreshToken`
4. Tokens stored in localStorage
5. User info decoded from `idToken`

### API Requests:
1. Axios interceptor reads tokens from localStorage
2. Adds `Authorization: Bearer <idToken>` header
3. API Gateway validates token with Cognito
4. If valid, request proceeds to Lambda
5. If invalid, returns 401 Unauthorized

### Token Refresh (TODO):
- Implement automatic token refresh when access token expires
- Use `refreshToken` to get new tokens
- Currently tokens expire after 1 hour

---

## 🧪 What to Test

### Development Mode:
- ✅ Login with admin/admin
- ✅ Create/edit/delete operations work
- ✅ Mock token is sent with requests
- ✅ Logout clears tokens

### Production Mode (after deployment):
- ✅ Login with real Cognito user
- ✅ Real JWT token is sent
- ✅ API Gateway validates token
- ✅ Protected routes require authentication
- ✅ Public routes work without auth
- ✅ Logout invalidates session

---

## 📝 Next Steps

1. **Test locally** with mock auth ✅
2. **Deploy to production** (GitHub Actions)
3. **Test production** with real Cognito user
4. **Implement token refresh** (optional enhancement)
5. **Add password change flow** (for temporary passwords)
6. **Remove old auth code** (authApi.ts, login Lambda)

---

## 🐛 Troubleshooting

### "Invalid credentials" in development:
- Make sure you're using `admin` / `admin`
- Check console for auth mode indicator

### "Invalid credentials" in production:
- Verify user exists in Cognito User Pool
- Check email is verified
- Try resetting password in AWS Console

### API returns 401 Unauthorized:
- Check token is being sent (Network tab → Headers)
- Verify token format: `Bearer <token>`
- Check token hasn't expired (1 hour validity)
- Verify API Gateway authorizer is configured

### Mock mode in production:
- Check `REACT_APP_ENV=production` in .env.production
- Verify Cognito IDs are set correctly
- Rebuild the frontend
