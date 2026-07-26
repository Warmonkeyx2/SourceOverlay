import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connect } from './db';
import layoutRoutes from './routes/layouts';
import authRoutes from './routes/auth';
import invitesRoutes from './routes/invites';
import http from 'http';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/layouts', layoutRoutes);
app.use('/api/invites', invitesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Connect to database and start server
const PORT = process.env.PORT || 4501;

connect().then(() => {
  server.listen(PORT, () => {
    console.log(`✓ Server running on :${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
