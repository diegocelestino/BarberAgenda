# Testing Cognito Authentication

## 🧪 Quick Test Guide

### Step 1: Start the Frontend
```bash
cd frontend
npm start
```

The app should start at `http://localhost:3000`

### Step 2: Navigate to Login
Go to: `http://localhost:3000/login`

You should see:
- Login form
- "🔧 Modo de Desenvolvimento (Mock Auth)" indicator
- "Credenciais demo: admin / admin" text

### Step 3: Login with Mock Credentials
- Username: `admin`
- Password: `admin`
- Click "Entrar"

### Step 4: Check Console
Open browser DevTools (F12) → Console tab

You should see:
```
✅ Logged in successfully (MOCK mode)
```

### Step 5: Navigate to Admin Area
After login, you should be redirected to `/admin`

### Step 6: Test Protected Operations
Try these actions (all should work):

1. **Create a Barber**
   - Go to Barbers page
   - Click "Novo Barbeiro"
   - Fill form and save

2. **Edit a Barber**
   - Click on a barber
   - Modify details
   - Save changes

3. **Create a Service**
   - Go to Services page
   - Click "Novo Serviço"
   - Fill form and save

### Step 7: Check Network Tab
Open DevTools → Network tab

Look at any API request (POST, PUT, DELETE):
- Check the **Headers** section
- Look for: `Authorization: Bearer mock-id-token`

This confirms the JWT token is being sent!

### Step 8: Test Logout
- Click logout button
- You should be redirected to home/login
- Console should show: `✅ Logged out successfully`

### Step 9: Try Invalid Credentials
- Go back to login
- Try: `wrong` / `wrong`
- Should show error: "Usuário ou senha inválidos"

---

## ✅ Success Criteria

If all these work, your Cognito integration is ready:
- ✅ Mock auth works in development
- ✅ JWT tokens are generated
- ✅ Tokens are sent with API requests
- ✅ Protected routes work
- ✅ Logout clears session

---

## 🚀 Next: Test in Production

After deploying to production:

1. Get your Cognito user credentials from AWS Console
2. Go to your production URL
3. Login with real credentials
4. Verify real JWT tokens are used
5. Test all protected operations

---

## 🐛 Common Issues

### Issue: "REACT_APP_API_URL is not configured"
**Solution**: Check `frontend/.env.local` exists and has `REACT_APP_API_URL`

### Issue: Login button doesn't work
**Solution**: Check browser console for errors

### Issue: API requests fail
**Solution**: 
- Make sure backend is running (if testing locally)
- Or set `REACT_APP_API_URL` to production API

### Issue: Not seeing mock mode indicator
**Solution**: 
- Check `REACT_APP_ENV=local` in `.env.local`
- Restart the dev server
