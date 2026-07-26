# 🏗️ SourceNinja Deployment Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USERS BROWSER                             │
│              (Chrome, Safari, Firefox, Mobile)                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ HTTPS
                      │
┌─────────────────────┴───────────────────────────────────────────┐
│                    VERCEL (Frontend)                             │
│                                                                   │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │         Next.js Application (React)                      │  │
│   │  ┌───────────────────────────────────────────────────┐  │  │
│   │  │ Pages:                                             │  │  │
│   │  │ - Login (neon-themed)                             │  │  │
│   │  │ - Signup (neon-themed)                            │  │  │
│   │  │ - Dashboard (layout grid)                         │  │  │
│   │  │ - Editor (drag & drop canvas)                     │  │  │
│   │  │ - Settings/MFA (2FA setup)                        │  │  │
│   │  └───────────────────────────────────────────────────┘  │  │
│   │                                                            │  │
│   │ URL: https://source-ninja-xxxx.vercel.app               │  │
│   │ Environment: NEXT_PUBLIC_API_URL                         │  │
│   │ CI/CD: Auto-deploys on git push to main                │  │
│   └─────────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ HTTPS (REST API calls)
                      │ POST /auth/signup
                      │ POST /auth/login
                      │ POST /mfa/setup
                      │ POST /mfa/enable
                      │
┌─────────────────────┴───────────────────────────────────────────┐
│                   RAILWAY (Backend)                              │
│                                                                   │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │         Express.js API Server                            │  │
│   │  ┌───────────────────────────────────────────────────┐  │  │
│   │  │ Routes:                                             │  │  │
│   │  │ - /auth/* (login, signup, verify)                 │  │  │
│   │  │ - /mfa/* (setup, enable, verify)                  │  │  │
│   │  │ - /layouts (CRUD operations)                      │  │  │
│   │  │ - /invites (user invitations)                     │  │  │
│   │  │ - /health (status check)                          │  │  │
│   │  └───────────────────────────────────────────────────┘  │  │
│   │                                                            │  │
│   │ Language: TypeScript/Node.js                             │  │
│   │ URL: https://source-ninja-backend-xxxx.railway.app      │  │
│   │ Environment: NODE_ENV, PORT, DATABASE_URL               │  │
│   │ CI/CD: Auto-deploys on git push to main                │  │
│   │                                                            │  │
│   │ Authentication:                                           │  │
│   │ - JWT tokens (10 minute expiry)                          │  │
│   │ - bcrypt password hashing                               │  │
│   │ - TOTP MFA support                                      │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ TCP Connection
                      │ postgresql://host:5432/railway
                      │
┌─────────────────────┴───────────────────────────────────────────┐
│                  RAILWAY (PostgreSQL)                            │
│                                                                   │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │            PostgreSQL Database                           │  │
│   │  ┌───────────────────────────────────────────────────┐  │  │
│   │  │ Tables:                                             │  │  │
│   │  │ - users (id, email, password_hash, mfa_secret)    │  │  │
│   │  │ - sessions (token, expires_at)                    │  │  │
│   │  │ - layouts (id, owner_id, title, data)            │  │  │
│   │  │ - layout_permissions (user_id, layout_id)        │  │  │
│   │  │ - invites (from_user, to_email, to_user_id)      │  │  │
│   │  │ - (auto-created indexes)                          │  │  │
│   │  └───────────────────────────────────────────────────┘  │  │
│   │                                                            │  │
│   │ Backup: Automatic daily (Railway built-in)              │  │
│   │ Access: Via Railway Data Browser or SQL client          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. User Signup Flow

```
┌──────────────────┐
│  User enters     │
│  email/password  │
│  in login form   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐      HTTP POST      ┌──────────────────┐
│  Frontend React  │─────────────────▶   │  Backend Express │
│  Component       │   /auth/signup      │  Route Handler   │
└──────────────────┘                     └────────┬─────────┘
                                                  │
                                                  │ Validate input
                                                  │ Hash password (bcrypt)
                                                  │
                                                  ▼
                                         ┌──────────────────┐
                                         │  PostgreSQL DB   │
                                         │  INSERT INTO     │
                                         │  users table     │
                                         └────────┬─────────┘
                                                  │
                                                  │ Return success
                                                  │
         ┌──────────────────────────────────────◀┘
         │
         ▼
    ┌──────────────┐
    │  Show success│
    │  message +   │
    │  verification│
    │  prompt      │
    └──────────────┘
```

### 2. MFA Verification Flow

```
┌──────────────────┐
│  User clicks     │
│  "Enable MFA"    │
│  button          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐      HTTP POST      ┌──────────────────┐
│  Frontend        │─────────────────▶   │  Backend         │
│  /settings/mfa   │   /mfa/setup        │  Generate:       │
└──────────────────┘                     │  - Secret        │
                                         │  - QR Code       │
                                         │  - Backup Codes  │
                                         └────────┬─────────┘
                                                  │
                                                  │ Return JSON
                                                  │
         ┌──────────────────────────────────────◀┘
         │
         ▼
    ┌──────────────────┐
    │  Display:        │
    │  - QR Code       │
    │  - Secret text   │
    │  - Input field   │
    │    for code      │
    └────────┬─────────┘
             │
             │ User scans QR code
             │ (Google Authenticator/Authy)
             │
             │ User enters 6-digit code
             │
             ▼
    ┌──────────────────┐      HTTP POST      ┌──────────────────┐
    │  Frontend        │─────────────────▶   │  Backend         │
    │  Form submit     │   /mfa/enable       │  Verify token:   │
    └──────────────────┘                     │  - speakeasy.    │
                                             │    totp.verify() │
                                             └────────┬─────────┘
                                                      │
                                                      │ If valid:
                                                      │ UPDATE users
                                                      │ mfa_enabled=true
                                                      │ mfa_secret=xxx
                                                      │
                                                      ▼
                                             ┌──────────────────┐
                                             │  PostgreSQL DB   │
                                             │  Save MFA data   │
                                             └────────┬─────────┘
                                                      │
             ┌────────────────────────────────────────┘
             │
             ▼
    ┌───────────────────┐
    │  Display success  │
    │  + backup codes   │
    │  (save safely)    │
    └───────────────────┘
```

### 3. Login with MFA Flow

```
┌──────────────────┐
│  User enters     │
│  email/password  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐      HTTP POST      ┌──────────────────┐
│  Frontend        │─────────────────▶   │  Backend         │
│  Login form      │   /auth/login       │  Check:          │
└──────────────────┘                     │  - Email exists  │
                                         │  - Password match│
                                         │  - MFA enabled?  │
                                         └────────┬─────────┘
                                                  │
                                    ┌─────────────┴─────────────┐
                                    │                           │
                          ┌─────────▼──────────┐    ┌──────────▼────┐
                          │  If MFA enabled:   │    │  If NO MFA:    │
                          │  Return:           │    │  Generate JWT  │
                          │  {requiresMfa:true,│    │  Return token  │
                          │   tempToken:xxx}   │    │  Redirect to   │
                          └────────┬───────────┘    │  dashboard     │
                                   │                └────────────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │  Frontend shows  │
                          │  MFA prompt:     │
                          │  - Enter 6-digit │
                          │    code          │
                          └────────┬─────────┘
                                   │
                                   │ User enters authenticator code
                                   │
                                   ▼
                          ┌──────────────────┐      HTTP POST      ┌──────────────┐
                          │  Frontend        │─────────────────▶   │  Backend     │
                          │  Submit form     │   /auth/login/mfa   │  Verify:     │
                          └──────────────────┘                     │  - tempToken │
                                                                    │  - MFA code  │
                                                                    │  via TOTP    │
                                                                    └────────┬─────┘
                                                                             │
                                                              ┌──────────────┘
                                                              │
                                                              ▼
                                                      ┌──────────────┐
                                                      │  Generate JWT│
                                                      │  token       │
                                                      └────────┬─────┘
                                                               │
                          ┌──────────────────────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  Return JWT  │
                   │  Redirect to │
                   │  dashboard   │
                   │  (logged in) │
                   └──────────────┘
```

---

## Environment Variables by Service

### Frontend (Vercel)

| Variable | Value | Set In | Required |
|----------|-------|--------|----------|
| `NEXT_PUBLIC_API_URL` | `https://backend-url.railway.app` | Vercel Dashboard | ✅ Yes |

**How to set:** Dashboard → Project → Settings → Environment Variables

### Backend (Railway)

| Variable | Value | Set In | Required |
|----------|-------|--------|----------|
| `NODE_ENV` | `production` | Railway Dashboard | ✅ Yes |
| `PORT` | `4501` | Railway Dashboard | ✅ Yes |
| `DATABASE_URL` | PostgreSQL connection string | Railway Dashboard | ✅ Yes |
| `JWT_SECRET` | Random 32+ character string | Railway Dashboard | ✅ Yes |
| `JWT_EXPIRY` | `10m` | Railway Dashboard | ✅ Yes |
| `FRONTEND_URL` | Vercel frontend URL | Railway Dashboard | ✅ Yes |
| `MFA_ISSUER` | `SourceNinja` | Railway Dashboard | ⚠️ Optional |
| `MFA_WINDOW` | `2` | Railway Dashboard | ⚠️ Optional |
| `EMAIL_PROVIDER` | `sendgrid` | Railway Dashboard | ⚠️ Optional |
| `SENDGRID_API_KEY` | SendGrid API key | Railway Dashboard | ⚠️ Optional |
| `FROM_EMAIL` | `noreply@sourceninja.app` | Railway Dashboard | ⚠️ Optional |

**How to set:** Railway Dashboard → Backend Service → Variables → Raw Editor

### Database (Railway PostgreSQL)

**Connection String Format:**
```
postgresql://username:password@host:port/database
```

**Railway provides this automatically in:**
- PostgreSQL Service → Connect → Full Connection String

---

## Deployment Sequence

### First-Time Setup (Order Matters!)

```
1. GitHub Setup
   └─ Push code: git push to main branch

2. Vercel Frontend
   └─ Import repo
   └─ Set Root Directory: frontend
   └─ Set NEXT_PUBLIC_API_URL: http://localhost:4501 (placeholder)
   └─ Deploy ✓

3. Railway Backend + Database
   └─ Import repo
   └─ Root Directory: backend (if needed)
   └─ PostgreSQL auto-created ✓
   └─ Get DATABASE_URL from PostgreSQL service
   └─ Set all environment variables
   └─ Deploy ✓

4. Connect Frontend to Backend
   └─ Get Railway backend URL
   └─ Update Vercel NEXT_PUBLIC_API_URL
   └─ Redeploy frontend ✓

5. Testing
   └─ Visit https://yourapp.vercel.app
   └─ Test signup/login
   └─ Test MFA
   └─ Invite beta users ✓
```

---

## Scaling Considerations

### Current Setup Handles

| Metric | Capacity | Cost |
|--------|----------|------|
| Concurrent Users | 50-100 | ~$5-10/mo |
| Monthly Requests | 1M-5M | ~$10-20/mo |
| Database Size | 1-5 GB | ~$5-10/mo |
| **Total** | **Production-ready** | **~$15-25/mo** |

### When to Upgrade

**When you reach 100+ concurrent users:**
- Upgrade Railway compute: `Performance 2` tier
- Enable database read replicas
- Add Redis caching layer

**When you reach 1M+ requests/month:**
- Keep Vercel (handles automatically)
- Upgrade Railway to dedicated resources
- Consider CDN for static assets

---

## Monitoring & Maintenance

### Daily Tasks
- Monitor error logs: Railway Deployments → Logs
- Check database size: Railway PostgreSQL → Stats
- Monitor API response times: Vercel Analytics

### Weekly Tasks
- Review failed authentications: Check backend logs
- Monitor Vercel build times: Dashboard → Analytics
- Verify backup status: Railway → Backups

### Monthly Tasks
- Database cleanup: Remove old sessions/logs
- Update dependencies: `npm update` in both frontend/backend
- Security audit: Review access logs and error patterns
- Cost analysis: Compare with usage metrics

---

## Disaster Recovery

### If Backend Crashes

1. Check Railway dashboard for service status
2. View logs for error cause
3. Click "Redeploy" to retry deployment
4. If database corrupt, switch to backup version

### If Frontend Stops Working

1. Check Vercel deployment logs
2. Verify environment variables still set
3. Rollback to previous deployment
4. Fix code locally and push new version

### If Database Corrupted

1. Railway auto-backup (daily) available
2. Click "Restore" from previous backup
3. Or delete PostgreSQL and recreate (data lost)
4. Always backup sensitive data externally

---

## Security Best Practices

✅ **Do:**
- Keep `JWT_SECRET` random and 32+ characters
- Use HTTPS everywhere (automatic)
- Enable database backups (Railway default)
- Rotate secrets quarterly
- Monitor error logs for suspicious activity

❌ **Don't:**
- Commit `.env` files to GitHub
- Share JWT_SECRET or API keys in chat
- Use default passwords or test credentials in production
- Disable HTTPS/SSL
- Run development mode in production

---

## Useful Links

| Resource | URL | Purpose |
|----------|-----|---------|
| Vercel Dashboard | https://vercel.com/dashboard | Deploy frontend |
| Railway Dashboard | https://railway.app | Deploy backend + DB |
| GitHub Repo | https://github.com/Warmonkeyx2/SourceNinja | Source code |
| Vercel Docs | https://vercel.com/docs | Deployment help |
| Railway Docs | https://docs.railway.app | Backend help |
| Next.js Docs | https://nextjs.org/docs | Frontend framework |
| Express Docs | https://expressjs.com | Backend framework |

---

## Support & Debugging

When something breaks:

1. **Check status dashboards first**
   - Vercel Status: https://www.vercelstatus.com
   - Railway Status: https://status.railway.app

2. **Review deployment logs**
   - Vercel: Dashboard → Deployments → Build Logs
   - Railway: Dashboard → Deployments → View Logs

3. **Test components individually**
   - Frontend: Visit your Vercel URL
   - Backend: Test `/health` endpoint
   - Database: View in Railway data browser

4. **Check environment variables**
   - Verify spelling is exact
   - Check values match actual services
   - Ensure no trailing spaces

5. **See TROUBLESHOOTING.md for solutions**
   - Common issues with solutions
   - Debug checklist
   - Contact support info

---

**Architecture Last Updated:** July 2026  
**Deployment Status:** Production Ready ✅
