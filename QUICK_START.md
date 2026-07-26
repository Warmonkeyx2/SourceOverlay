# 🚀 SourceNinja - Quick Start to Production

## What's Ready

Your code is now on GitHub and ready for production deployment! Here's exactly what you need to do to get users:

### ✅ Completed
- [x] Neon-themed UI (login, signup, dashboard, editor)
- [x] Multi-user authentication with email verification
- [x] MFA (Two-Factor Authentication) system implemented
- [x] Moderator invite system (by user ID or email)
- [x] Layout editor with real-time editing
- [x] PostgreSQL support for production
- [x] Git repository initialized: https://github.com/Warmonkeyx2/SourceNinja.git

## 3-Step Deployment to Production

### Step 1: Deploy Frontend to Vercel (2 minutes)
1. Go to https://vercel.com
2. Click "Add New Project"
3. Select your SourceNinja repo (it's already on GitHub)
4. Set Root Directory to `frontend`
5. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
6. Click Deploy ✓

**Result:** Your frontend is live at `yourname.vercel.app`

### Step 2: Deploy Backend to Railway (2 minutes)
1. Go to https://railway.app
2. New Project → Deploy from GitHub Repo
3. Select SourceNinja
4. Click Deploy

Railway will:
- Create a PostgreSQL database automatically
- Build your backend
- Set a live URL (something like `backend-prod-xxx.railway.app`)

### Step 3: Connect Frontend to Backend (1 minute)
1. Copy your Railway backend URL
2. Go to Vercel Dashboard → Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` with your Railway URL
4. Redeploy

**Done!** Users can now access your app at `yourname.vercel.app`

## Database & Environment Variables

### Railway Provides (Automatic)
- PostgreSQL database with connection string
- Automatic backups
- Database browser in dashboard

### You Need to Configure

In your Railway Dashboard → Variables:
```
NODE_ENV=production
DATABASE_URL=postgresql://... (Railway provides this)
JWT_SECRET=generate-a-random-long-string-here
JWT_EXPIRY=10m
FRONTEND_URL=https://yourname.vercel.app
MFA_ISSUER=SourceNinja
MFA_WINDOW=2
```

## MFA Authentication

### How Users Enable MFA
1. After login, go to Settings → Two-Factor Authentication
2. Scan QR code with Google Authenticator or Authy
3. Enter 6-digit code to verify
4. Save backup codes somewhere safe

### How It Works
- TOTP (Time-based One-Time Password) - industry standard
- Works offline - no internet needed after setup
- Backup codes for recovery if phone is lost

## Key Features for Beta Users

✨ **What Users Can Do:**
- Create account with email verification
- Enable 2FA for security
- Create unlimited layouts
- Drag & drop sources on canvas
- Invite other users (by email or user ID)
- Grant edit permissions
- Save layouts in real-time

## Testing Before Launch

```bash
# Test on your machines
1. Frontend: https://yourname.vercel.app
2. Test signup flow
3. Test email verification (check console logs)
4. Test MFA setup
5. Test creating layouts
6. Test user invitations
7. Test permission system
```

## Domain Setup (Optional)

To use a custom domain like `app.yoursite.com`:

**Vercel:**
1. Domains → Add → yoursite.com
2. Add DNS records (Vercel provides them)
3. Takes 5-10 minutes

**Railway:**
1. Settings → Custom Domain
2. Add your subdomain (e.g., `api.yoursite.com`)

## Security Checklist

Before inviting beta users:
- [ ] Change `JWT_SECRET` from default
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (automatic)
- [ ] Test MFA works
- [ ] Database backups enabled (automatic on Railway)
- [ ] SSL certificates configured (automatic)

## Troubleshooting

**Can't log in?**
- Check DATABASE_URL in Railway variables
- Check if PostgreSQL service is running

**MFA not working?**
- Ensure `speakeasy` package installed: `npm ls speakeasy`
- Check phone time is synchronized
- Try authenticator code again (codes expire every 30s)

**Frontend can't reach backend?**
- Verify NEXT_PUBLIC_API_URL in Vercel matches Railway URL
- Check CORS is enabled in backend (it is)
- Check backend service is running

## Cost Estimate

| Service | Cost | Why |
|---------|------|-----|
| Vercel | Free | Generous free tier |
| Railway | ~$5/month | PostgreSQL + compute |
| **Total** | **~$5/month** | Includes 20-50 users |

**Scale:** At 1000 users, still under $50/month.

## Next: Invite Beta Users

```
Share this link: https://yourname.vercel.app

Tell them:
- Download Google Authenticator or Authy
- Sign up for account
- Enable 2FA in settings
- Try creating a layout
- Test inviting a friend
```

## Getting Help

- **Backend logs:** Railway Dashboard → Logs
- **Frontend logs:** Vercel Dashboard → Logs
- **Database queries:** Railway → PostgreSQL → Browser
- **Code issues:** GitHub issues or check error logs

## What to Do Now

1. **Get Vercel account** → https://vercel.com
2. **Get Railway account** → https://railway.app
3. **Deploy frontend** (Step 1 above)
4. **Deploy backend** (Step 2 above)
5. **Connect them** (Step 3 above)
6. **Test it works**
7. **Share with beta users**

🎉 **You're live!** Users can now:
- Sign up securely
- Enable 2FA
- Create overlay layouts
- Collaborate in real-time
- Invite team members

Need help? Check DEPLOYMENT_COMPLETE.md for detailed info.
