# SourceNinja - Deployment Guide

## Overview
SourceNinja is a multi-user overlay editing platform with authentication, MFA, and real-time collaboration features. This guide covers deploying to production using Vercel (frontend) and a serverless backend solution.

## Architecture

```
Frontend (Next.js)
    ↓ (Deployed on Vercel)
    ↓
Backend API (Express.js)
    ↓ (Deployed on Railway/Fly/Heroku)
    ↓
PostgreSQL Database
    ↓ (Hosted on Railway/Heroku/AWS RDS)
```

## Prerequisites
- GitHub account (code already pushed to https://github.com/Warmonkeyx2/SourceNinja.git)
- Vercel account (free)
- Railway.app account (recommended for backend + database) or similar

## Step 1: Frontend Deployment (Vercel)

### 1.1 Connect to Vercel
1. Go to https://vercel.com
2. Click "Add New Project"
3. Select "Import Git Repository"
4. Connect your GitHub account and select "SourceNinja"
5. Configure project:
   - Framework: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 1.2 Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_API_URL=https://your-backend-api.railway.app
```

### 1.3 Deploy
Click "Deploy" and wait for completion. Your frontend will be live at a `.vercel.app` domain.

## Step 2: Backend Deployment (Railway.app)

### 2.1 Create Railway Project
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select the SourceNinja repository
5. Click "Deploy Now"

### 2.2 Add PostgreSQL Database
1. In your Railway project, click "Add Service"
2. Select "PostgreSQL"
3. A database will be provisioned automatically

### 2.3 Configure Environment Variables
In Railway Dashboard, add variables:

```
NODE_ENV=production
PORT=4501
DATABASE_URL=postgresql://user:password@host:5432/sourceninja
JWT_SECRET=your-very-long-random-secret-key-here
JWT_EXPIRY=10m
FRONTEND_URL=https://your-frontend.vercel.app
MFA_ISSUER=SourceNinja
MFA_WINDOW=2
```

### 2.4 Update Build Settings
In your Railway service settings:
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

### 2.5 Deploy
Railway will automatically build and deploy your backend.

## Step 3: Database Setup

### PostgreSQL Connection String
Railway provides a connection string in format:
```
postgresql://username:password@host:port/database
```

Add this to your `DATABASE_URL` environment variable in Railway.

### Initial Schema
The backend automatically runs migrations on startup. The following tables are created:
- `users` - User accounts with MFA support
- `sessions` - Active user sessions
- `layouts` - Overlay layouts
- `layout_permissions` - Permission system
- `invites` - User invitations

## Step 4: MFA Authentication

### How It Works
1. User enables MFA in settings
2. System generates a TOTP secret
3. User scans QR code with authenticator app (Google Authenticator, Authy, etc.)
4. User enters 6-digit code to verify
5. Login now requires both password AND authenticator code

### Dependencies
MFA is implemented using:
- `speakeasy` - TOTP generation/verification
- `qrcode` - QR code generation

These are already included in `backend/package.json`.

## Step 5: Environment Variables Summary

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-api.railway.app
```

### Backend (.env)
```
NODE_ENV=production
PORT=4501
DATABASE_URL=postgresql://user:password@host:port/db
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRY=10m
FRONTEND_URL=https://your-frontend-url.vercel.app
MFA_ISSUER=SourceNinja
MFA_WINDOW=2
```

## Step 6: Update Git & Redeploy

After any changes:
```bash
git add .
git commit -m "Update configuration"
git push origin main
```

Both Vercel and Railway will automatically redeploy on push to main branch.

## Monitoring & Troubleshooting

### Health Check
```
GET https://your-backend-api.railway.app/health
```

Should return: `{ "status": "ok" }`

### Common Issues

**Database Connection Failed**
- Verify DATABASE_URL is correct
- Check if Railway database is running
- Ensure IP whitelist includes Railway's IP range

**MFA Not Working**
- Verify `speakeasy` and `qrcode` packages are installed
- Check JWT token is being passed correctly
- Ensure phone's time is synchronized

**Frontend Can't Connect to Backend**
- Verify CORS is enabled in backend
- Check NEXT_PUBLIC_API_URL matches backend URL
- Ensure backend service is running

## Production Checklist

- [ ] Environment variables set correctly
- [ ] Database migrations completed
- [ ] Both services deployed and healthy
- [ ] CORS configured properly
- [ ] HTTPS enabled (automatic on Vercel/Railway)
- [ ] JWT_SECRET changed from default
- [ ] MFA working on test account
- [ ] Backups configured for database

## Performance Optimization

### Frontend
- Images optimized via Next.js Image component
- Code splitting enabled
- CSS-in-JS minimized

### Backend
- Connection pooling enabled
- Request logging configured
- Error handling implemented
- Rate limiting recommended

## Support

For issues or questions:
1. Check Railway/Vercel dashboard logs
2. Review backend error messages in console
3. Verify environment variables are set
4. Check GitHub issues: github.com/Warmonkeyx2/SourceNinja

## Next Steps

1. ✅ Push to GitHub (DONE)
2. ✅ Create Vercel project (follow Step 1)
3. ✅ Create Railway project (follow Step 2)
4. ✅ Configure PostgreSQL (follow Step 3)
5. ✅ Test authentication flow
6. ✅ Enable MFA for users
7. ✅ Invite beta users
8. ✅ Monitor performance and errors
