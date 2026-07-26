# Backend Setup Guide

## Overview
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Port**: 4501 (development)
- **Repository**: https://github.com/Warmonkeyx2/SourceNinja.git (backend folder)
- **Build Output**: `dist` directory

## Local Development

### Prerequisites
```
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- PostgreSQL 12+ (local or remote)
```

### Installation
```bash
# Clone repository
git clone https://github.com/Warmonkeyx2/SourceNinja.git
cd SourceNinja/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Environment Variables
File: `.env.local`

```
# Server
NODE_ENV=development
PORT=4501

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sourceninja

# JWT
JWT_SECRET=your-development-secret-key
JWT_EXPIRY=10m

# Email
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-key-here
FROM_EMAIL=noreply@sourceninja.com

# Frontend
FRONTEND_URL=http://localhost:4500

# MFA
MFA_ISSUER=SourceNinja
MFA_WINDOW=2
```

### Database Setup

#### Local PostgreSQL
```bash
# Create database
createdb sourceninja

# Add to DATABASE_URL in .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/sourceninja
```

#### PostgreSQL on Railway
```bash
# 1. Create Railway project
# 2. Add PostgreSQL database service
# 3. Copy connection string from Railway dashboard
# 4. Add to .env as DATABASE_URL
DATABASE_URL=postgresql://user:password@host:port/railway_dbname
```

### Running Development Server
```bash
npm run dev
```
Server accessible at: http://localhost:4501

### Build for Production
```bash
npm run build
npm start
```

## Build Configuration

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### vercel.json
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "NODE_ENV": "production"
  }
}
```

## API Routes

### Authentication
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (requires token) |
| POST | `/api/auth/verify-email` | Verify email with token |
| POST | `/api/auth/refresh` | Refresh JWT token |

### Layouts
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/layouts` | Get user layouts |
| POST | `/api/layouts` | Create new layout |
| GET | `/api/layouts/:id` | Get layout details |
| PUT | `/api/layouts/:id` | Update layout |
| DELETE | `/api/layouts/:id` | Delete layout |

### Collaborators
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/layouts/:id/collaborators` | Get collaborators |
| POST | `/api/layouts/:id/collaborators` | Add collaborator |
| DELETE | `/api/layouts/:id/collaborators/:userId` | Remove collaborator |

### MFA (Multi-Factor Authentication)
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/mfa/setup` | Generate MFA secret |
| POST | `/api/mfa/verify` | Verify MFA setup |
| POST | `/api/mfa/disable` | Disable MFA |

### Health Check
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/health` | Server health status |

## Database Schema

Auto-created on startup:

### users
```sql
- id (uuid, primary key)
- email (varchar, unique)
- username (varchar, unique)
- password_hash (varchar)
- profile_icon (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

### sessions
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- token (text)
- expires_at (timestamp)
- created_at (timestamp)
```

### layouts
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- title (varchar)
- content (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### layout_collaborators
```sql
- id (uuid, primary key)
- layout_id (uuid, foreign key)
- user_id (uuid, foreign key)
- role (varchar, default: 'viewer')
- created_at (timestamp)
```

### layout_permissions
```sql
- id (uuid, primary key)
- layout_id (uuid, foreign key)
- user_id (uuid, foreign key)
- can_edit (boolean)
- can_share (boolean)
- created_at (timestamp)
```

### invites
```sql
- id (uuid, primary key)
- layout_id (uuid, foreign key)
- inviter_id (uuid, foreign key)
- invitee_email (varchar)
- token (text)
- expires_at (timestamp)
- created_at (timestamp)
```

## Railway Deployment

### Prerequisites
- Railway account (https://railway.app)
- GitHub account connected to Railway

### Step-by-Step

1. **Create Railway Project**
   - Go to https://railway.app/new
   - Select "Empty Project"

2. **Add PostgreSQL Database**
   - Click "+ Add"
   - Select "PostgreSQL"
   - Railway auto-generates connection string

3. **Add Backend Service**
   - Click "+ Add"
   - Select "GitHub Repo"
   - Connect to `Warmonkeyx2/SourceNinja`
   - Select branch: `main`
   - Configure:
     - Root Directory: `backend`
     - Build Command: `npm run build`
     - Start Command: `npm start`

4. **Set Environment Variables**
   - In Railway dashboard, go to Backend service > Variables
   - Add all from `.env.example`:
     ```
     NODE_ENV=production
     PORT=4501
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=your-production-secret-key-change-this
     JWT_EXPIRY=10m
     EMAIL_PROVIDER=sendgrid
     SENDGRID_API_KEY=your-sendgrid-key
     FROM_EMAIL=noreply@sourceninja.com
     FRONTEND_URL=https://your-frontend-domain.vercel.app
     MFA_ISSUER=SourceNinja
     MFA_WINDOW=2
     ```

5. **Configure Domain**
   - Railway assigns automatic domain
   - Or connect custom domain in Railway settings
   - Note the API URL (e.g., `https://api.sourceninja-prod-xxxx.railway.app`)

6. **Deploy**
   - Push code to GitHub `main` branch
   - Railway auto-deploys

### Important Notes
- Railway provides PostgreSQL connection automatically
- Use `${{Postgres.DATABASE_URL}}` for database connection
- Check Railway logs: Dashboard > Backend > Logs
- Deployments shown in: Dashboard > Deployments

## Security Best Practices

### Environment Variables
- `JWT_SECRET`: Use strong random string (32+ characters)
  ```bash
  # Generate with: openssl rand -base64 32
  ```
- Never commit `.env` files
- Change secrets for production

### JWT Configuration
- `JWT_EXPIRY`: Set to 10-15 minutes
- Refresh tokens for extended sessions
- Verify token signature on every request

### Database Security
- Use strong PostgreSQL passwords
- Restrict database access by IP (Railway does this)
- Enable SSL connections
- Regular backups (Railway handles automatically)

### CORS
- Only allow frontend domains
- Don't use `*` in production
- Specific domains: `https://frontend.vercel.app`

### Email Verification
- Verify email before full access
- Token expiry: 24 hours
- Resend option available

## Package.json Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server with ts-node |
| `npm run build` | Compile TypeScript to dist/ |
| `npm start` | Start production server |

## Common Issues

### Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- For Railway: Wait 2-3 minutes for service startup

### JWT Errors
```
TokenExpiredError: jwt expired
```
- Token needs refresh
- Frontend should redirect to login
- Implement refresh token endpoint

### Email Not Sending
```
Error: Invalid SENDGRID_API_KEY
```
- Verify SendGrid API key in .env
- Check SendGrid account has email credits
- Verify FROM_EMAIL is verified in SendGrid

### CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```
- Add frontend domain to CORS config
- Backend CORS already configured for * (change in production)
- Example: `"http://localhost:4500"` for dev

### TypeScript Build Errors
```
error TS1005: Declaration or statement expected
```
- Check `tsconfig.json` is valid JSON
- Ensure `outDir: "./dist"` exists
- Run `npm install` to update dependencies

## Monitoring & Logs

### Local Development
```bash
# Enable debug logs
DEBUG=* npm run dev

# Check database
psql -U postgres -d sourceninja -c "SELECT * FROM users;"
```

### Railway Production
- Logs: Dashboard > Backend > Logs tab
- Real-time streaming of server output
- Search by keyword or timestamp

### Errors to Monitor
1. Database connection errors
2. JWT validation failures
3. Email delivery failures
4. CORS rejection errors
5. Unhandled promise rejections

## Performance Considerations

- Connection pooling: Use `pg` with default pool
- Query optimization: Add indexes on foreign keys
- Caching: Implement for frequently accessed data
- Rate limiting: Add per endpoint if needed

## API Response Format

All responses return JSON:

### Success (200)
```json
{
  "data": {...},
  "message": "Operation successful"
}
```

### Error (400/500)
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

## Integration with Frontend

Frontend makes requests to:
```
${NEXT_PUBLIC_API_URL}/api/auth/login
${NEXT_PUBLIC_API_URL}/api/layouts
${NEXT_PUBLIC_API_URL}/api/mfa/setup
```

Set `NEXT_PUBLIC_API_URL` in frontend to your backend URL:
- Local: `http://localhost:4501`
- Production: `https://api.sourceninja-prod-xxxx.railway.app`

## Troubleshooting Checklist

- [ ] PostgreSQL running and accessible
- [ ] DATABASE_URL correctly formatted
- [ ] JWT_SECRET set and secure
- [ ] SENDGRID_API_KEY valid
- [ ] FROM_EMAIL verified in SendGrid
- [ ] FRONTEND_URL points to correct domain
- [ ] TypeScript compiles without errors
- [ ] All routes tested locally
- [ ] CORS headers allowing frontend
- [ ] Error handling implemented
