# Source Overlay Studio - Web App

OBS-like web-based overlay editor for any streaming service. Build and manage overlay layouts by adding sources (URLs, browsers, etc.) and arranging them on a canvas. Perfect for streamers on YouTube, Twitch, Facebook, or any platform.

## Features

- Create and manage multiple overlay layouts
- Add sources by URL (works with any website, browser capture, streaming tools)
- Drag, resize, and layer sources on canvas
- Customize background colors
- Save/load layouts to/from database
- Simple web interface (no login required)
- Run on secondary monitor
- Works with any streaming service

## Quick Start

### With Docker
```bash
cd H:\Projects\SOURCE OVERLAY LIVE
docker-compose up

# Frontend: http://localhost:4500
# Backend API: http://localhost:4501
```

### Without Docker
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

## Project Structure

```
.
├── backend/          # Node.js Express API
│   ├── src/
│   │   ├── index.ts           # Main server
│   │   ├── db.ts              # Database connection
│   │   ├── routes/            # API endpoints (layouts, sources)
│   │   └── middleware/        # Error handling, CORS
│   └── package.json
├── frontend/         # Next.js React app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.tsx          # Home / layout list
│   │   │   ├── editor/[id].tsx    # Canvas editor
│   │   │   └── api/
│   │   ├── components/            # LayoutEditor, SourcePanel, etc.
│   │   ├── hooks/                 # useWebSocket, useEditor
│   │   └── styles/
│   └── package.json
├── database/
│   └── migrations/            # SQL schema (layouts, sources only)
├── shared/
│   └── types/                 # Shared TypeScript types
└── docker-compose.yml
```



## Usage

1. Open frontend at http://localhost:3000
2. Click "Create Layout"
3. Add sources by entering URLs
4. Drag, resize, and layer sources on canvas
5. Save layout
6. Load layouts from dashboard

## API Reference

### GET /api/layouts
List all layouts

### POST /api/layouts
Create layout: `{"title": "My Layout", "bgColor": "#0d1117"}`

### GET /api/layouts/:id
Get layout details with all sources

### PUT /api/layouts/:id
Update layout: `{"title": "...", "bgColor": "...", "data": [sources]}`

### DELETE /api/layouts/:id
Delete layout

## Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### To VPS / Cloud Platform

1. Set up PostgreSQL database
2. Deploy backend to `/api` endpoint
3. Deploy frontend to `/` endpoint
4. Update `NEXT_PUBLIC_API_URL` to production backend URL

## License

MIT
- `JWT_SECRET` - Random string for JWT signing
- `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET`
- `TWITCH_REDIRECT_URI` - Production URL

## Contributing

1. Create feature branch
2. Make changes
3. Test locally with Docker
4. Push and create PR

## License

MIT
