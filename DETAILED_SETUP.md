# 📋 Detailed Vercel Deployment Guide

## Overview

SourceNinja is a **monorepo** with two services:
- **Frontend**: Next.js application (React UI with neon theme)
- **Backend**: Express.js API server (User auth, layouts, invites, MFA)

This guide walks you through deploying both to Vercel (frontend) and Railway (backend).

---

## Part 1: Frontend Deployment to Vercel (Step-by-Step)

### Prerequisites
- Vercel account (free at https://vercel.com)
- GitHub account (code already here: https://github.com/Warmonkeyx2/SourceNinja.git)
- Backend API URL (from Railway - we'll do this after frontend)

### Step 1: Sign Into Vercel

1. Go to https://vercel.com
2. Click "Sign Up" or "Sign In"
3. Choose "Continue with GitHub" (easiest)
4. Authorize Vercel to access your GitHub account

### Step 2: Create New Project

1. Click "Add New Project" (or "New" → "Project")
2. Under "Import Git Repository," click "Select a Repository"
3. Search for and select: **SourceNinja** (or Warmonkeyx2/SourceNinja)
4. Click "Import"

**Screenshot:** You should see a dialog showing "Importing from GitHub" with the repo name

### Step 3: Configure Project

You're now in the project setup wizard. Here's what you need to do:

#### 3.1 Select Framework
- **Framework**: Next.js (auto-detected)
- **Project Name**: `source-ninja` (or your preferred name)
- **Root Directory**: `frontend`

![vercel-setup-1](These should be auto-filled, but verify them)

#### 3.2 Build and Output Settings
- **Build Command**: `npm install && npm run build` ✓ (auto-filled)
- **Output Directory**: `.next` ✓ (auto-filled)
- **Install Command**: `npm install` ✓ (auto-filled)

#### 3.3 Environment Variables
This is crucial! Add this variable:

| Key | Value | Type |
|-----|-------|------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4501` | **For now** |

**Important:** We'll update this after we deploy the backend to Railway. For now, use `http://localhost:4501` so you can test locally.

**How to add:**
1. Click "Add Environment Variable"
2. Key: `NEXT_PUBLIC_API_URL`
3. Value: `http://localhost:4501` (placeholder)
4. Click the "+" button

#### 3.4 Deploy Settings
- **Git Branch**: `main` ✓ (should be auto-set)
- **Production Deployment**: Automatic on push to main

### Step 4: Deploy

1. Click the blue "Deploy" button
2. Wait 2-3 minutes for Vercel to build
3. You'll see a "Congratulations" screen with your deployment URL

**Your Frontend URL will look like:**
```
https://source-ninja-abc123.vercel.app
```

Save this URL! You'll need it for:
- Testing the app
- Setting backend CORS
- Updating environment variables

### Step 5: Test Frontend Deployment

1. Click on your deployment URL or go to your Vercel dashboard
2. You should see the SourceNinja login page
3. Try signing up (won't work yet without backend, but UI should load)

**What You Should See:**
- Dark gradient background ✓
- Neon purple/cyan text ✓
- Login form with styled inputs ✓
- Gradient buttons ✓

---

## Part 2: Backend Deployment to Railway (Step-by-Step)

### Prerequisites
- Railway account (free at https://railway.app)
- Backend code already on GitHub
- 10 minutes for setup

### Step 1: Sign Into Railway

1. Go to https://railway.app
2. Click "Get Started" or "Sign In"
3. Sign in with GitHub (recommended)
4. Authorize Railway

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose: **Warmonkeyx2/SourceNinja**
4. Click "Deploy Now"

Railway will automatically:
- Fork the repo (optional)
- Start building the backend
- Create a PostgreSQL database
- Assign deployment URLs

### Step 3: Wait for Build Completion

You'll see:
```
Building...  ↳ source-ninja-backend [railway deployment]
```

This takes 1-2 minutes. When done, you'll see:
```
✓ Deployment live at: https://source-ninja-backend-prod-abc123.railway.app
```

### Step 4: Configure PostgreSQL Database

Railway automatically creates a PostgreSQL database. Now you need to get the connection string.

1. Go to your Railway project dashboard
2. Click on "PostgreSQL" service (in the left sidebar or main panel)
3. Click "Connect" tab
4. Copy the full connection string that looks like:
   ```
   postgresql://username:password@host:port/railway
   ```

Keep this handy! You'll need it in the next step.

### Step 5: Set Environment Variables in Railway

1. Go back to your project dashboard
2. Click on the backend service (Node.js icon)
3. Go to "Variables" tab
4. Click "Raw Editor" button (right side)

Paste these variables (replace values as indicated):

```
NODE_ENV=production
PORT=4501
DATABASE_URL=postgresql://username:password@host:port/railway
JWT_SECRET=your-random-secret-key-here-min-32-characters-long
JWT_EXPIRY=10m
FRONTEND_URL=https://source-ninja-abc123.vercel.app
MFA_ISSUER=SourceNinja
MFA_WINDOW=2
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_key_here_optional_for_now
FROM_EMAIL=noreply@sourceninja.app
```

**Detailed Variable Explanations:**

| Variable | Value | Why |
|----------|-------|-----|
| `NODE_ENV` | `production` | Tells Node.js to run in production mode |
| `PORT` | `4501` | Backend listens on this port |
| `DATABASE_URL` | PostgreSQL connection string | From Railway PostgreSQL service |
| `JWT_SECRET` | 32+ character random string | Use `openssl rand -base64 32` to generate |
| `JWT_EXPIRY` | `10m` | How long login tokens last |
| `FRONTEND_URL` | Your Vercel URL | For CORS and redirects |
| `MFA_ISSUER` | `SourceNinja` | Name shown in authenticator apps |
| `MFA_WINDOW` | `2` | Time window for TOTP verification |

**How to Generate JWT_SECRET:**

Open a terminal and run:
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows PowerShell:
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Result will look like:
# aBc123XyZ9+/==
```

Copy the output and use as `JWT_SECRET`.

### Step 6: Get Your Backend URL

After variables are saved:

1. Go to "Deployments" tab
2. Copy the live deployment URL (looks like `https://source-ninja-backend-prod-xxx.railway.app`)

This is your **Backend API URL**. Save it!

### Step 7: Test Backend Deployment

```bash
# Test if backend is running
curl https://source-ninja-backend-prod-xxx.railway.app/health

# Should return:
# {"status":"ok"}
```

---

## Part 3: Connect Frontend to Backend (Critical!)

### Step 1: Update Frontend Environment Variables

1. Go to Vercel Dashboard
2. Select your project (`source-ninja`)
3. Go to Settings → Environment Variables
4. Find `NEXT_PUBLIC_API_URL`
5. Change value from `http://localhost:4501` to your Railway backend URL:
   ```
   https://source-ninja-backend-prod-xxx.railway.app
   ```
6. Click "Save"

### Step 2: Redeploy Frontend

After changing environment variables, you need to redeploy:

**Option A: Manual redeploy**
1. Go to Deployments tab
2. Click on the latest deployment
3. Click "Redeploy"

**Option B: Auto redeploy (recommended)**
1. Make a small change to your code
2. Push to GitHub: `git add . && git commit -m "Update API URL" && git push`
3. Vercel automatically redeploys

### Step 3: Verify Connection

1. Go to your frontend URL: `https://source-ninja-abc123.vercel.app`
2. Try to sign up
3. Check browser console (F12 → Console tab)
4. Look for API calls to your backend URL
5. If you see successful requests, you're connected! ✓

---

## Part 4: Test Full Integration

### Test 1: User Signup

1. Go to your frontend URL
2. Click "Sign Up"
3. Enter:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123!@`
   - Confirm: `Test123!@`
4. Click "Sign Up"

**Expected:** Success message (email verification will be simulated in dev)

### Test 2: User Login

1. Go to login page
2. Enter credentials from Test 1
3. Click "Login"

**Expected:** Redirect to dashboard

### Test 3: MFA Setup

1. After login, go to Settings (if profile page exists) or navigate to `/settings/mfa`
2. Click "Enable MFA"
3. Scan QR code with Google Authenticator or Authy
4. Enter 6-digit code
5. Click "Verify & Enable MFA"

**Expected:** Success message, backup codes displayed

### Test 4: Logout and Login with MFA

1. Logout from dashboard
2. Login with email/password
3. You should see "Enter Authenticator Code"
4. Open your authenticator app and enter code
5. Click "Verify MFA"

**Expected:** Logged in successfully with MFA

---

## Part 5: Troubleshooting

### Issue: "Cannot connect to API"

**Symptoms:** Signup/login doesn't work, network errors in console

**Solutions:**
1. Check `NEXT_PUBLIC_API_URL` is correct in Vercel
2. Verify backend service is running (check Railway dashboard)
3. Check backend logs in Railway: Deployments → Logs
4. Ensure CORS is enabled in backend (it is by default)

### Issue: "Database connection error"

**Symptoms:** Backend crashes, 500 errors from API

**Solutions:**
1. Verify `DATABASE_URL` in Railway is correct
2. Check PostgreSQL service is running (Railway dashboard)
3. View backend logs for detailed error message
4. Try restarting the PostgreSQL service

### Issue: "MFA codes don't work"

**Symptoms:** 6-digit code says "invalid"

**Solutions:**
1. Verify phone clock is synchronized
2. Codes expire every 30 seconds - don't wait too long
3. Try backup codes instead
4. Check `MFA_WINDOW` variable is set to `2`

### Issue: "Email verification not working"

**Symptoms:** Can't verify email after signup

**Solutions:**
1. For development, email verification is simulated
2. For production, you need SENDGRID_API_KEY:
   - Create free SendGrid account
   - Generate API key
   - Add to Railway environment variables

### Issue: "Blank page on Vercel"

**Symptoms:** Frontend shows white/blank screen

**Solutions:**
1. Check browser console for JavaScript errors (F12)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check Vercel deployment logs
4. Try different browser
5. Redeploy frontend

---

## Part 6: Database Management

### View Database in Railway

1. Go to Railway project dashboard
2. Click "PostgreSQL" service
3. Click "Data" tab to see database browser
4. You can see all tables: `users`, `layouts`, `invites`, etc.

### Connect with SQL Client (Optional)

For advanced database management:

1. Get PostgreSQL connection details from Railway
2. Download: pgAdmin (free) or DBeaver (free)
3. Create new connection with Railway details
4. Query/manage tables visually

### Backup Database

Railway automatically backs up your database daily. To manually backup:

1. In Railway PostgreSQL service
2. Click "Export" button
3. Download SQL dump file

---

## Part 7: Production Checklist

Before inviting users, verify:

- [ ] Frontend URL is accessible and loads without errors
- [ ] Login page has neon styling (dark bg, cyan/purple text)
- [ ] Signup works and returns success message
- [ ] MFA setup displays QR code correctly
- [ ] Login with MFA works end-to-end
- [ ] Backend logs show successful database connections
- [ ] Environment variables are all set correctly
- [ ] HTTPS is enabled (automatic on Vercel/Railway)
- [ ] No JavaScript errors in browser console
- [ ] API responses are under 200ms

---

## Part 8: Custom Domain (Optional)

### Add Domain to Vercel

1. Vercel Dashboard → Settings → Domains
2. Click "Add Domain"
3. Enter your domain: `app.yoursite.com`
4. Follow DNS instructions (varies by provider)
5. Wait 5-10 minutes for DNS propagation

### Add Domain to Railway Backend

1. Railway project → Backend service → Settings
2. Find "Domains" section
3. Add custom domain: `api.yoursite.com`
4. Update DNS records
5. Update frontend `NEXT_PUBLIC_API_URL` to new domain

---

## Part 9: Environment Variables Reference

### Complete Environment Variables List

**Frontend (.env.local or Vercel Dashboard)**
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

**Backend (Railway Variables)**
```
# Deployment
NODE_ENV=production
PORT=4501

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Authentication
JWT_SECRET=generate-a-random-32-character-string
JWT_EXPIRY=10m

# Frontend
FRONTEND_URL=https://your-vercel-domain.app

# MFA
MFA_ISSUER=SourceNinja
MFA_WINDOW=2

# Email (optional - for production)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=noreply@sourceninja.app
```

---

## Summary

You now have:

✅ **Frontend** deployed on Vercel  
✅ **Backend** deployed on Railway  
✅ **PostgreSQL Database** running  
✅ **MFA** fully functional  
✅ **Authentication** working end-to-end  

**Next Steps:**
1. Follow this guide step-by-step
2. Test each section
3. Share your frontend URL with beta users
4. Monitor logs for any issues
5. Iterate based on user feedback

**Support Resources:**
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- GitHub Issues: https://github.com/Warmonkeyx2/SourceNinja
- Browser Console: Press F12 for debugging
