# Vercel Deployment Guide for SourceNinja

## Frontend Deployment (Vercel)
The frontend is configured for Vercel deployment out of the box.

### Steps:
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., https://api.sourceninja.com)

3. Deploy!

## Backend Deployment Options

### Option 1: Railway.app (Recommended)
1. Push code to GitHub
2. Connect Railway to your GitHub repo
3. Set environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: production
4. Deploy!

### Option 2: Fly.io
Similar process with environment variables setup.

### Option 3: Heroku (Deprecated but still works)
1. Install Heroku CLI
2. `heroku create your-app-name`
3. Add PostgreSQL addon
4. Deploy with `git push heroku main`

## Database Setup
The backend requires PostgreSQL for production. Use a service like:
- Railway.app
- Heroku Postgres
- AWS RDS
- DigitalOcean Managed Database

Update your `DATABASE_URL` connection string in environment variables.
