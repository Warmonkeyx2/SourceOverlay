# Source Ninja Frontend

Next.js 14 frontend application for Source Ninja Studio.

## Development

### Prerequisites
- Node.js 18+ 
- npm 9+

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` from `.env.example`:
```bash
cp .env.example .env.local
```

3. Update environment variables in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4501
NEXT_PUBLIC_WS_URL=ws://localhost:4501
```

4. Start development server:
```bash
npm run dev
```

The app will be available at http://localhost:4500

## Building

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Deployment

### Vercel Deployment

This app is configured for Vercel deployment.

1. Create a Vercel account and import the GitHub repository
2. Set environment variable in Vercel Project Settings:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
3. Deploy

The app will be available at your Vercel domain.

### Docker

```bash
docker build -t sourceninja-frontend .
docker run -p 4500:4500 sourceninja-frontend
```

## Project Structure

```
src/
├── pages/          # Next.js pages and routes
├── components/     # React components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
└── styles/        # Global CSS
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (required for production)
- `NEXT_PUBLIC_WS_URL`: WebSocket URL for real-time features (optional)

Note: Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Build Info

- **Framework**: Next.js 14
- **Runtime**: Node.js
- **Package Manager**: npm
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Development Port**: 4500
