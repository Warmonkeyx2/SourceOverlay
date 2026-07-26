# 🛠️ Vercel Deployment Troubleshooting Guide

## Common Issues & Solutions

### 1. Build Failures

#### Issue: "Build failed: npm ERR!"

**Cause:** Missing dependencies or build script errors

**Solution:**
1. Check `package.json` has `build` script:
   ```json
   "scripts": {
     "build": "next build",
     "dev": "next dev"
   }
   ```
2. Verify all dependencies are listed in `package.json`:
   ```bash
   # In frontend directory
   npm install
   npm run build
   ```
3. Look at Vercel Build Logs for specific error
4. Fix locally, commit, and push to trigger redeploy

---

### 2. Environment Variables Not Working

#### Issue: API calls go to undefined URL

**Symptoms:**
- Console shows `undefined` or `http://undefined:4501`
- API requests fail with 404 or CORS errors

**Solution:**
1. Verify variable is prefixed with `NEXT_PUBLIC_`:
   ```
   ✓ NEXT_PUBLIC_API_URL (correct)
   ✗ API_URL (won't work - not public)
   ```
2. Check spelling exactly matches usage in code:
   ```typescript
   // Frontend code
   const apiUrl = process.env.NEXT_PUBLIC_API_URL;
   // Must match environment variable name
   ```
3. Redeploy after changing variables (not automatic):
   - Option A: Push a new commit to GitHub
   - Option B: Click "Redeploy" in Vercel dashboard
4. Clear browser cache: `Ctrl+Shift+Delete`

---

### 3. API Connection Errors

#### Issue: Frontend can't reach backend

**Symptoms:**
- CORS error in console
- `ERR_CONNECTION_REFUSED` or `ECONNREFUSED`
- Network tab shows failed requests

**Solution:**

**Step 1:** Verify API URL is correct
```javascript
// Open browser console (F12) and paste:
console.log(process.env.NEXT_PUBLIC_API_URL);
// Should print: https://your-backend-url.railway.app
```

**Step 2:** Test API is reachable
```bash
# In terminal, replace with your backend URL:
curl https://your-backend-url.railway.app/health
# Should return: {"status":"ok"}
```

**Step 3:** Check CORS is enabled in backend
- Backend should have CORS middleware (it does by default)
- Verify `FRONTEND_URL` env var matches your Vercel domain

**Step 4:** Check Railway backend is running
- Go to Railway dashboard
- Click backend service
- View logs - should show "Server listening on port 4501"
- If crashed, check error message and fix

---

### 4. "vercel.json required" Error

#### Issue: Vercel says you need vercel.json for multiple services

**Cause:** Monorepo with frontend and backend directories detected

**Solution:**
1. Check root directory has `vercel.json`:
   ```json
   {
     "version": 2,
     "projects": [
       {
         "name": "source-ninja-frontend",
         "rootDirectory": "frontend"
       },
       {
         "name": "source-ninja-backend",
         "rootDirectory": "backend"
       }
     ]
   }
   ```
2. Make sure it's in **project root** (not in frontend/backend)
3. Commit: `git add vercel.json && git commit -m "Add vercel.json for monorepo"`
4. Push and redeploy

---

### 5. Blank White Screen on Frontend

#### Issue: Deployed frontend shows blank page

**Symptoms:**
- URL loads but page is white
- No errors in browser console

**Solution:**

**Step 1:** Check Vercel build logs
1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click latest deployment
5. Click "Build Logs" - look for warnings/errors

**Step 2:** Common causes
- Wrong `outputDirectory` in vercel.json (should be `.next`)
- Missing environment variables
- Next.js build failed silently

**Step 3:** Debug locally
```bash
cd frontend
npm install
npm run build
npm run start
# Visit http://localhost:3000
# Does it work locally? If no, fix it first
```

**Step 4:** Redeploy
```bash
git add .
git commit -m "Fix frontend build"
git push
```

---

### 6. MFA Not Working

#### Issue: MFA codes say "invalid" or QR code won't scan

**Symptoms:**
- QR code doesn't load
- 6-digit code always fails
- Error in MFA setup

**Solution:**

**Step 1:** Check backend is running
- Go to Railway dashboard
- View backend logs
- Look for: `Server listening on port 4501`

**Step 2:** Verify MFA dependencies installed
```bash
# In backend directory
npm ls speakeasy qrcode
# Should show versions, not "not installed"
```

**Step 3:** Check MFA_WINDOW variable
- Railway backend variables: `MFA_WINDOW=2`
- This allows 2 time steps (60 seconds) for verification

**Step 4:** Sync phone time
- MFA uses time-based codes
- Ensure your phone time is synchronized:
  - iPhone: Settings → General → Date & Time → Auto
  - Android: Settings → System → Date & Time → Auto

**Step 5:** Test with backup codes
- If regular codes fail, try backup codes instead
- If those work too, problem is in TOTP generation
- Check backend logs for TOTP errors

---

### 7. Database Connection Failed

#### Issue: Backend crashes with database error

**Symptoms:**
- 500 errors from API
- "Cannot connect to database"
- "ECONNREFUSED" in Railway logs

**Solution:**

**Step 1:** Verify DATABASE_URL is correct
1. Go to Railway PostgreSQL service
2. Click "Connect" tab
3. Copy full connection string
4. In backend variables, paste exactly (no typos!)

**Step 2:** Check PostgreSQL is running
1. Railway Dashboard → PostgreSQL service
2. Should show green "running" status
3. If red/yellow, try restarting service

**Step 3:** Test connection locally
```bash
# With your DATABASE_URL:
psql postgresql://user:pass@host:5432/db
# Type: \dt (lists tables)
# Type: \q (quit)
```

**Step 4:** Reset database if corrupted
1. Railway Dashboard → PostgreSQL → Delete Service
2. Add new PostgreSQL service (automatic)
3. Wait for initialization
4. Update DATABASE_URL in backend variables
5. Redeploy backend

---

### 8. Slow Deployments

#### Issue: Vercel deployment takes 5+ minutes

**Cause:** Node modules redownload or large build

**Solution:**
1. Vercel caches dependencies - usually 30-60 seconds for subsequent builds
2. First build always slower
3. To speed up:
   - Minimize npm packages
   - Use ESM modules where possible
   - Check for large dev dependencies

---

### 9. CORS Errors

#### Issue: Frontend blocked by browser CORS policy

**Error:**
```
Access to XMLHttpRequest at 'https://...' from origin 'https://...'
has been blocked by CORS policy
```

**Solution:**

**Step 1:** Verify backend CORS is configured
- Check backend/src/index.ts has CORS middleware:
  ```typescript
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));
  ```

**Step 2:** Check FRONTEND_URL matches
- In Railway environment variables:
  ```
  FRONTEND_URL=https://your-vercel-domain.app
  ```
- No trailing slash!
- Must include `https://`

**Step 3:** Redeploy backend after setting FRONTEND_URL
```bash
# In Railway, after changing variables, click "Redeploy"
```

---

### 10. "Project not found" Error

#### Issue: Deployment URL doesn't work

**Symptoms:**
- 404 error
- "Project not found"
- Wrong deployment URL

**Solution:**
1. Verify you're using the correct URL from Vercel
2. Go to Vercel Dashboard → Project Settings → Domains
3. Copy the `.vercel.app` domain
4. URL should be: `https://project-name-xxx.vercel.app`

---

## Debug Checklist

When something breaks, check in this order:

### 1. Frontend (Vercel) Issues
- [ ] Browser console has no JavaScript errors (F12)
- [ ] `NEXT_PUBLIC_API_URL` environment variable is set
- [ ] Environment variable matches backend URL exactly
- [ ] Frontend page loads (not blank/white)
- [ ] CSS/styling loads correctly

### 2. Backend (Railway) Issues
- [ ] Backend service status is "running" (green)
- [ ] Backend logs show no errors
- [ ] `/health` endpoint returns `{"status":"ok"}`
- [ ] All database variables are set correctly
- [ ] PostgreSQL service is running (green)
- [ ] Environment variables have no typos

### 3. Network Issues
- [ ] Test API from command line: `curl <backend-url>`
- [ ] Check browser Network tab (F12) for request status
- [ ] Verify CORS headers are present
- [ ] Ensure firewall allows outbound HTTPS

### 4. Data Issues
- [ ] Clear browser cache: `Ctrl+Shift+Delete`
- [ ] Clear local storage: `localStorage.clear()` in console
- [ ] Try incognito/private browser tab
- [ ] Test on different device/network

---

## Getting More Help

### Check Logs

**Vercel Logs:**
1. Dashboard → Project
2. "Deployments" tab
3. Click a deployment
4. "Build Logs" or "Runtime Logs"

**Railway Logs:**
1. Dashboard → Service
2. "Deployments" tab
3. Click "View Logs" for build output
4. Or "Live Logs" for runtime errors

### Common Log Error Messages

```
Error: Cannot find module 'express'
→ Run: npm install in backend directory

Error: ENOENT: no such file or directory, open '...'
→ File path is wrong or missing

Error: listen EADDRINUSE: address already in use :::4501
→ Another process using port 4501, restart Railway

Error: connection refused (ECONNREFUSED)
→ Database not running or connection string wrong

Error: SyntaxError: Unexpected token }
→ JavaScript syntax error, check code locally
```

### Online Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Railway Docs: https://docs.railway.app
- Express Docs: https://expressjs.com
- Stack Overflow: Search "[vercel]" tag

---

## Contact Support

If you're stuck:

1. **Vercel Support:** https://vercel.com/support
2. **Railway Support:** https://discord.gg/railway (Discord)
3. **GitHub Issues:** Post in repository issues
4. **Stack Overflow:** Tag with `[vercel]` and `[next.js]`

---

## Still Not Working?

Try this in order:

1. ❌ **Delete and redeploy everything:**
   ```bash
   # In Vercel Dashboard: Delete project
   # In Railway Dashboard: Delete services
   # Start over from "Part 2" in DETAILED_SETUP.md
   ```

2. ❌ **Check git history:**
   ```bash
   git log --oneline
   # Revert recent changes if they broke things
   git revert <commit-hash>
   ```

3. ❌ **Test locally first:**
   ```bash
   # Make sure it works on localhost:4500 and :4501
   # Before deploying to production
   ```

4. ❌ **Post in #help or create GitHub issue:**
   - Include screenshots of errors
   - Include output of deployment logs
   - Include exact error messages
