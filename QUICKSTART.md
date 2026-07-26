# Quick Start Guide

## Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ OR Docker Desktop

## Option 1: Using Docker (Recommended)

### Step 1: Install Docker
- Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Step 2: Start the Application
```bash
cd H:\Projects\SOURCE OVERLAY LIVE
docker-compose up
```

Wait for the containers to start. You should see:
```
✓ Server running on :4501
```

### Step 3: Open in Browser
- **Frontend**: http://localhost:4500
- **Backend API**: http://localhost:4501

---

## Option 2: Without Docker (Local Development)

### Step 1: Install PostgreSQL
- Download and install [PostgreSQL 14+](https://www.postgresql.org/download/)
- During installation:
  - Set password to: `password`
  - Remember: username is `postgres`

### Step 2: Create Database
Open PowerShell and run:
```powershell
psql -U postgres
```

Then type:
```sql
CREATE DATABASE source_overlay_studio;
\q
```

### Step 3: Create Tables
```sql
psql -U postgres -d source_overlay_studio -f database/migrations/001_initial_schema.sql
```

### Step 4: Install Dependencies
Open two PowerShell windows:

**Terminal 1 - Backend:**
```powershell
cd H:\Projects\SOURCE OVERLAY LIVE\backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd H:\Projects\SOURCE OVERLAY LIVE\frontend
npm install
npm run dev
```

### Step 5: Open in Browser
- **Frontend**: http://localhost:4500
- **Backend API**: http://localhost:4501

---

## Troubleshooting

### "npm: command not found"
- Node.js is not installed or not in PATH
- Restart PowerShell after installing Node.js

### "Cannot connect to database"
- Ensure PostgreSQL is running
- Check `.env` file has correct DATABASE_URL

### "Port 4500/4501 already in use"
- Find the process using the port:
```powershell
netstat -ano | findstr :4500
netstat -ano | findstr :4501
```
- Kill the process:
```powershell
taskkill /PID <PID> /F
```

### "Cannot GET /"
- Frontend is still building. Wait 30 seconds and refresh browser
- Check browser console for errors (F12)

---

## Usage

1. **Create Layout**: Enter a title and click "Create Layout"
2. **Edit Layout**: Click "Edit" on a layout card
3. **Add Source**: In the sidebar, enter source name and URL, click "Add Source"
4. **Drag Sources**: Click and drag sources on the canvas to position them
5. **Save**: Click "Save Layout" to persist changes

## Features
- ✅ Works with any URL (YouTube, Twitch, Discord, custom sites)
- ✅ Drag and drop positioning
- ✅ Layer sources with z-index
- ✅ Save and load multiple layouts
- ✅ No authentication required (local use)

---

## Support
If something isn't working:
1. Check the console output for errors
2. Try restarting Docker/services
3. Ensure all ports are not in use
4. Clear browser cache (Ctrl+Shift+Del)
