# Full Stack Deployment Guide

## Quick Reference

| Component | Dev URL | Prod Platform | Port |
|-----------|---------|----------------|------|
| Frontend | http://localhost:4500 | Vercel | 443 |
| Backend | http://localhost:4501 | Railway | 443 |
| Database | localhost:5432 | Railway PostgreSQL | 5432 |

## Architecture

```
┌─────────────────┐
│   Next.js App   │
│  (localhost:4500)│──────────┐
└─────────────────┘           │
                              │ HTTP/HTTPS
                              │ API Calls
                              ▼
┌─────────────────────────────────────┐
│     Express Backend API             │
│     (localhost:4501)                │
│  - Authentication (JWT + TOTP)     │
│  - Layout Management               │
│  - Collaborations                  │
│  - MFA Setup                       │
└─────────────────────────────────────┘
                      │
                      │ SQL
                      ▼
        ┌──────────────────────┐
        │  PostgreSQL Database │
        │  (localhost:5432)    │
        └──────────────────────┘
```

## Environment Configuration

### Frontend (.env.local or Vercel)
```
NEXT_PUBLIC_API_URL=http://localhost:4501              # Development
NEXT_PUBLIC_API_URL=https://api.railroad-xxxx.app      # Production
NEXT_PUBLIC_WS_URL=wss://api.railroad-xxxx.app         # Optional
```

### Backend (.env or Railway)
```
NODE_ENV=development                                     # or production
PORT=4501
DATABASE_URL=postgresql://user:pass@localhost:5432/db   # or Railway
JWT_SECRET=your-secret-key-here                         # Change in prod
FRONTEND_URL=http://localhost:4500                      # or vercel.app domain
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@sourceninja.com
MFA_ISSUER=SourceNinja
```

## Development Setup

### Step 1: Backend Database
```bash
# Option A: Local PostgreSQL
createdb sourceninja

# Option B: Use existing setup
# DATABASE_URL already in .env.example
```

### Step 2: Start Backend
```bash
cd backend
npm install
npm run dev
# Server running on http://localhost:4501
```

### Step 3: Start Frontend
```bash
cd frontend
npm install
npm run dev
# App running on http://localhost:4500
```

### Step 4: Test API Connection
- Go to http://localhost:4500/login
- Frontend should load without API errors
- Check browser console for any CORS issues

## Production Deployment Flow

### Phase 1: Deploy Backend (Railway)

1. **Create Railway Project**
   - https://railway.app/new
   - Select "Empty Project"

2. **Add PostgreSQL**
   - Click "+ Add"
   - Select "PostgreSQL"
   - Note connection string for later

3. **Add Backend Service**
   - "+ Add" → "GitHub Repo"
   - Select: `Warmonkeyx2/SourceNinja`
   - Configure:
     - Root Directory: `backend`
     - Build Command: `npm run build`
     - Start Command: `npm start`

4. **Set Environment Variables (Railway Dashboard)**
   ```
   NODE_ENV=production
   PORT=4501
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=<generate-strong-random-key>
   FRONTEND_URL=https://sourceninja-frontend.vercel.app
   SENDGRID_API_KEY=<your-sendgrid-key>
   FROM_EMAIL=noreply@sourceninja.com
   MFA_ISSUER=SourceNinja
   MFA_WINDOW=2
   ```

5. **Deploy**
   - Push to `main` branch or manual deploy
   - Wait for build (2-3 minutes)
   - Get backend URL from Railway (e.g., `https://api.railroad-xxxx.railway.app`)

6. **Test Backend**
   ```bash
   curl https://api.railroad-xxxx.railway.app/health
   # Should return: {"status":"ok"}
   ```

### Phase 2: Deploy Frontend (Vercel)

1. **Create Vercel Project**
   - https://vercel.com/new
   - Import: `Warmonkeyx2/SourceOverlay`
   - Framework: Next.js
   - Root Directory: `./` (default)

2. **Set Environment Variables (Vercel Dashboard)**
   - Project Settings > Environment Variables
   ```
   NEXT_PUBLIC_API_URL = https://api.railroad-xxxx.railway.app
   NEXT_PUBLIC_WS_URL = wss://api.railroad-xxxx.railway.app
   ```
   - For: Production and Preview

3. **Deploy**
   - Manual deploy or automatic on push
   - Wait for build (2-3 minutes)
   - Get frontend URL from Vercel

4. **Update Backend (Railway)**
   - Go back to Railway
   - Backend service > Variables
   - Update: `FRONTEND_URL=https://sourceninja-frontend.vercel.app`
   - Trigger redeploy

5. **Test Full Integration**
   - Visit: https://sourceninja-frontend.vercel.app
   - Go to login page
   - Check browser console for API errors
   - Try signing up (should work if backend is connected)

## API Request Flow

### Login Example
```
1. User enters email/password in frontend
2. Frontend: POST to ${NEXT_PUBLIC_API_URL}/api/auth/login
3. Backend: Validates credentials, returns JWT token
4. Frontend: Stores token in localStorage
5. Frontend: Includes token in future requests (Authorization header)
```

### Required Headers
```
Authorization: Bearer <jwt-token-from-login>
Content-Type: application/json
```

## CORS Configuration

### Backend (Express)
Already configured in src/index.ts:
```typescript
app.use(cors());
```

For production, change to:
```typescript
app.use(cors({
  origin: [
    'https://sourceninja-frontend.vercel.app',
    'https://custom-domain.com'
  ]
}));
```

## Database Migrations

### Auto-Migration on Startup
Backend automatically creates tables on first run:
- `users`, `sessions`, `layouts`, `layout_collaborators`, etc.
- Stored in `src/db/migrations/` or similar

### Manual Migration
If needed, connect to PostgreSQL:
```bash
# Local
psql -U postgres -d sourceninja

# Railway
railway connect postgres
```

## Environment Variables Summary

### Frontend Only (Public)
- `NEXT_PUBLIC_API_URL` - Backend URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL (optional)

### Backend Only (Secret)
- `JWT_SECRET` - Must be strong and random
- `DATABASE_URL` - PostgreSQL connection
- `SENDGRID_API_KEY` - Email service
- `JWT_EXPIRY` - Token duration

### Both (Configuration)
- `NODE_ENV` - development/production
- `PORT` - Server port
- `FRONTEND_URL` - Frontend domain (backend needs for CORS)

## Secrets Management

### Generate Secrets
```bash
# JWT Secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use openssl
openssl rand -base64 32
```

### Store in Railway
- Variables are encrypted at rest
- Only visible in Railway dashboard
- Injected at runtime
- Never logged or exposed

## Monitoring

### Frontend (Vercel)
- Dashboard > Project > Deployments
- Real-time logs available
- Error tracking via console

### Backend (Railway)
- Dashboard > Project > Backend > Logs
- Real-time streaming
- Deployment history

### Database (Railway)
- Dashboard > Project > PostgreSQL
- Connection info
- Metrics and monitoring

## Troubleshooting Steps

### 1. Frontend won't load
- Check Vercel build logs
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for errors

### 2. Login fails
- Verify backend URL is correct
- Check backend is running
- Look at backend logs on Railway
- Verify JWT_SECRET is set

### 3. Database connection error
- Check DATABASE_URL format
- Verify PostgreSQL is accessible
- On Railway: Check service is running
- Look at backend logs for detailed error

### 4. Email not sending
- Verify SENDGRID_API_KEY
- Check FROM_EMAIL is verified in SendGrid
- Look at backend logs for email errors

### 5. CORS errors
- Verify backend CORS config includes frontend domain
- Check frontend URL in backend env vars
- Look at browser network tab for headers

## Health Check Commands

```bash
# Backend health
curl http://localhost:4501/health
# Output: {"status":"ok"}

# Database connection
psql postgresql://user:pass@localhost:5432/sourceninja -c "SELECT 1"

# Frontend build
npm run build
```

## Deployment Checklist

- [ ] Frontend repository at: https://github.com/Warmonkeyx2/SourceOverlay.git
- [ ] Backend repository at: https://github.com/Warmonkeyx2/SourceNinja.git
- [ ] Backend deployed to Railway with PostgreSQL
- [ ] Backend environment variables all set
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables point to backend
- [ ] JWT_SECRET is strong and random
- [ ] SendGrid API key valid
- [ ] Database migrations run on backend startup
- [ ] Both frontend and backend healthy checks pass
- [ ] Login flow tested end-to-end
- [ ] Custom domain configured (optional)

## Post-Deployment

### Verify Everything
1. Visit frontend URL in browser
2. Try to sign up
3. Verify email sent (check inbox)
4. Try to login
5. Test layout creation
6. Test collaboration feature

### Set Up Monitoring
- Enable Vercel Analytics
- Set up Railway alerts
- Configure log streaming
- Enable error tracking

### Optimize
- Configure custom domain
- Set up CDN/caching
- Review performance metrics
- Implement auto-scaling if needed

## Support

For issues, check:
1. Vercel build logs (frontend)
2. Railway logs (backend)
3. PostgreSQL connection (database)
4. CORS headers (browser Network tab)
5. Environment variables (both platforms)

## Git Repositories

**Frontend:**
- Repository: https://github.com/Warmonkeyx2/SourceOverlay.git
- Branch: `master`
- Deploy: Vercel (connects automatically)

**Backend:**
- Repository: https://github.com/Warmonkeyx2/SourceNinja.git
- Branch: `main`
- Deploy: Railway (connects automatically)
- Note: Railway uses `backend/` subfolder

## Notes

- Frontend builds are fast (~1-2 min)
- Backend builds include TypeScript compilation (~2-3 min)
- Database auto-creates tables on first run
- Changes to env vars require redeploy
- JWT tokens expire after configured time (default 10m)
- All data is encrypted in transit (HTTPS/WSS)
