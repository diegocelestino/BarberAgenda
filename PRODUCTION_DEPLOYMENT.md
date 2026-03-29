# Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Infrastructure (Already Done)
- [x] Cognito User Pool deployed
- [x] API Gateway with Cognito Authorizer
- [x] Protected routes configured
- [x] Admin user created in Cognito

### ✅ Frontend Code (Already Done)
- [x] Cognito service implemented
- [x] AuthContext updated
- [x] API service adds JWT tokens
- [x] Login page with redirect logic
- [x] Protected routes configured
- [x] Mock auth for development

### ✅ Deployment Workflow (Just Updated)
- [x] Updated to fetch Cognito outputs
- [x] Passes Cognito config to build

---

## 🚀 Deployment Steps

### 1. Commit and Push Changes

```bash
git add .
git commit -m "feat: implement AWS Cognito authentication with JWT tokens"
git push origin main
```

This will trigger **two GitHub Actions**:
1. **Deploy Infrastructure** (if infrastructure files changed)
2. **Deploy Frontend** (frontend files changed)

### 2. Monitor Deployment

Go to your GitHub repository:
- Click on **Actions** tab
- Watch the workflows run:
  - ✅ Deploy Infrastructure (if triggered)
  - ✅ Deploy Frontend

### 3. Get Your Production URL

After deployment completes, check the workflow logs for:
```
🚀 Frontend deployed to: https://xxxxx.cloudfront.net
```

Or get it from AWS Console:
```bash
aws cloudformation describe-stacks \
  --stack-name BarbershopStack \
  --query 'Stacks[0].Outputs[?OutputKey==`DistributionURL`].OutputValue' \
  --output text
```

---

## 🧪 Testing in Production

### 1. Access Your Production URL
Open: `https://your-cloudfront-url.cloudfront.net`

### 2. Check Authentication Mode
- Go to `/login`
- You should **NOT** see "🔧 Modo de Desenvolvimento"
- You should **NOT** see "Credenciais demo: admin / admin"
- This confirms it's using **real Cognito**

### 3. Login with Real Credentials
Use the credentials you created in AWS Cognito:
- Username: (your Cognito username)
- Password: (your Cognito password)

### 4. Verify JWT Token
Open DevTools → Network tab:
- Login
- Check any API request (POST, PUT, DELETE)
- Look at **Request Headers**
- Should see: `Authorization: Bearer eyJraWQ...` (real JWT token, not "mock-id-token")

### 5. Test Protected Routes
Try accessing without login:
- https://your-url/admin
- https://your-url/admin/barbers
- https://your-url/admin/services

Should redirect to `/login` ✅

### 6. Test Admin Operations
After login, test:
- ✅ Create a barber
- ✅ Edit a barber
- ✅ Delete a barber
- ✅ Create a service
- ✅ Edit a service
- ✅ Delete a service
- ✅ Manage appointments

### 7. Test Public Routes
Logout and test public access:
- ✅ View barbers list (GET /barbers)
- ✅ View barber details (GET /barbers/{id})
- ✅ View services (GET /services)
- ✅ Create appointment (POST /barbers/{id}/appointments)

These should work **without authentication** ✅

### 8. Test API Gateway Authorization
Try to call a protected endpoint without token:

```bash
# This should return 401 Unauthorized
curl -X POST https://your-api-url/barbers \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","serviceIds":[]}'
```

Expected response: `{"message":"Unauthorized"}`

---

## 🔍 Troubleshooting

### Issue: Still seeing mock mode in production
**Check:**
- View page source, search for `REACT_APP_ENV`
- Should be `production`
- If not, check GitHub Actions logs

**Fix:**
- Verify workflow passes `REACT_APP_ENV: production`
- Redeploy

### Issue: Login fails with "Invalid credentials"
**Check:**
- User exists in Cognito User Pool
- Email is verified
- Password is correct
- User status is "CONFIRMED" (not "FORCE_CHANGE_PASSWORD")

**Fix:**
- Go to AWS Console → Cognito → User Pools
- Select your user
- Check status
- Reset password if needed

### Issue: API returns 401 Unauthorized after login
**Check:**
- JWT token is being sent (Network tab)
- Token format: `Bearer <token>`
- Token is not expired (1 hour validity)

**Fix:**
- Logout and login again
- Check browser console for errors
- Verify Cognito User Pool ID and Client ID are correct

### Issue: "Challenge required: NEW_PASSWORD_REQUIRED"
**Cause:** User has temporary password

**Fix:**
1. Go to AWS Console → Cognito
2. Select user
3. Reset password
4. Set permanent password
5. Mark as confirmed

### Issue: CORS errors
**Check:**
- API Gateway CORS configuration
- Should allow `Authorization` header

**Fix:**
- Already configured in CDK stack
- Redeploy infrastructure if needed

---

## 📊 What to Monitor

### CloudWatch Logs
- Lambda function logs
- API Gateway access logs
- Look for 401/403 errors

### Cognito Metrics
- Sign-in attempts
- Failed authentications
- Token refresh requests

### API Gateway Metrics
- Request count
- 4xx errors (authorization failures)
- Latency

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Production URL loads
- ✅ No mock mode indicator on login page
- ✅ Can login with real Cognito credentials
- ✅ Real JWT tokens in API requests
- ✅ Protected routes require authentication
- ✅ Public routes work without auth
- ✅ All CRUD operations work
- ✅ API Gateway rejects requests without valid tokens

---

## 📝 Post-Deployment Tasks

### Optional Enhancements:
1. **Token Refresh**: Implement automatic token refresh before expiry
2. **Password Change**: Add UI for users to change password
3. **Forgot Password**: Add password reset flow
4. **MFA**: Enable multi-factor authentication in Cognito
5. **Custom Domain**: Add custom domain to CloudFront
6. **SSL Certificate**: Add ACM certificate for HTTPS

### Cleanup:
1. Remove old auth code:
   - `backend/lambda-ts/src/auth/login.ts`
   - Login Lambda function from CDK
   - UsersTable from DynamoDB (if not needed)

---

## 🔐 Security Notes

- JWT tokens expire after 1 hour
- Refresh tokens valid for 30 days
- API Gateway validates all tokens
- No authentication logic in Lambda functions
- Cognito handles all auth securely
- Passwords stored securely in Cognito (never in code)

---

## 📞 Support

If you encounter issues:
1. Check GitHub Actions logs
2. Check CloudWatch logs
3. Check browser console
4. Check Network tab for API responses
5. Verify Cognito configuration in AWS Console
