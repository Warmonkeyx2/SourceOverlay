# Frontend Setup Guide

## Overview
- **Framework**: Next.js 14
- **Runtime**: Node.js 18+
- **Port**: 4500 (development)
- **Repository**: https://github.com/Warmonkeyx2/SourceOverlay.git
- **Build Output**: `.next` directory

## Local Development

### Prerequisites
```
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
```

### Installation
```bash
# Clone repository
git clone https://github.com/Warmonkeyx2/SourceOverlay.git
cd SourceOverlay

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Environment Variables
File: `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:4501
NEXT_PUBLIC_WS_URL=ws://localhost:4501
```

For development, leave these pointing to localhost:4501 (backend dev server).

### Running Development Server
```bash
npm run dev
```
App accessible at: http://localhost:4500

### Build for Production
```bash
npm run build
npm start
```

## Build Configuration

### next.config.js
```javascript
{
  reactStrictMode: false,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    esmExternals: true,
  },
}
```

### tsconfig.json
- `moduleResolution: "bundler"` (Next.js standard)
- `strict: false` (relaxed mode for compatibility)
- `isolatedModules: true` (required by Next.js)

### vercel.json
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

## Vercel Deployment

### Project Setup
1. Create new project in Vercel
2. Connect GitHub repository: `https://github.com/Warmonkeyx2/SourceOverlay.git`
3. Framework preset: **Next.js**
4. Root directory: `./` (default)

### Environment Variables (Vercel)
Set in: Project Settings > Environment Variables

| Variable | Value | Scope |
|----------|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.com` | Production, Preview |
| `NEXT_PUBLIC_WS_URL` | `wss://your-backend-url.com` | Production, Preview (optional) |

**Important**: These are public variables (exposed to browser). Never put secrets here.

### Deployment
- Automatic: Push to `master` branch triggers deployment
- Manual: Use Vercel dashboard "Redeploy" button
- Build takes ~2-3 minutes
- Production URL: `https://sourceninja-frontend.vercel.app` (or custom domain)

## Pages Structure

```
src/pages/
├── _app.tsx              # App wrapper
├── index.tsx             # Dashboard (requires auth)
├── login.tsx             # Login page
├── signup.tsx            # Sign up page
├── profile.tsx           # User profile
├── dashboard.tsx         # Layouts dashboard
├── editor/[id].tsx       # Layout editor
├── settings/mfa.tsx      # MFA settings
└── auth/twitch.tsx       # Twitch OAuth callback
```

## API Integration

All API calls use environment variable `NEXT_PUBLIC_API_URL`:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

axios.get(`${apiUrl}/api/auth/me`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Authentication Flow

1. User logs in at `/login`
2. Backend returns JWT token
3. Token stored in `localStorage`
4. All subsequent requests include token in `Authorization` header
5. On token expiry, user redirected to `/login`

## Package.json Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server on port 4500 |
| `npm run build` | Build for production (.next directory) |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Common Issues

### 404 Errors on Vercel
- Verify `Root Directory` is set to `./`
- Check `.gitignore` is excluding `node_modules/` and `.next/`
- Ensure `next.config.js` uses `module.exports` (not ES export)

### Build Failures
- Clear Vercel cache and redeploy
- Check `tsconfig.json` has `"isolatedModules": true`
- Ensure TypeScript errors don't block build

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct in Vercel
- Check backend CORS settings allow frontend domain
- Verify backend is running and accessible

## Git Workflow

```bash
# Make changes locally
git add .
git commit -m "Description"

# Push to GitHub
git push origin master

# Vercel automatically deploys from master branch
```

## Performance

- Static generation where possible
- Dynamic routes for user-specific data
- Image optimization enabled
- Automatic code splitting

## Security

- JWT tokens stored in localStorage (consider httpOnly cookie)
- API calls authenticated with Bearer token
- No sensitive data in `NEXT_PUBLIC_*` variables
- CORS configured to backend domain only

## Monitoring

Vercel provides:
- Build logs: Project Settings > Deployments
- Runtime logs: Real-time errors and warnings
- Analytics: Page performance metrics
- Deployment history: All previous versions

For production issues, check:
1. Vercel deployment logs
2. Browser console for client errors
3. Network tab for API errors
4. Backend logs for API issues

## Troubleshooting Checklist

- [ ] `.env.local` or Vercel env vars correctly set
- [ ] Backend API URL is accessible from browser
- [ ] CORS headers configured in backend
- [ ] JWT token not expired
- [ ] No build errors in Vercel logs
- [ ] Next.js version compatible (^14.0.0)
- [ ] Node version 18+ in Vercel
