import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { verifyToken } from './auth';

interface ClientSession {
  ws: WebSocket;
  userId: string;
  layoutId: string;
}

const clients = new Map<string, ClientSession>();

export const setupWebSocket = (server: HTTPServer) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req: any) => {
    const url = req.url || '';
    const params = new URLSearchParams(url.split('?')[1]);
    const token = params.get('token');
    const layoutId = params.get('layoutId');

    if (!token || !layoutId) {
      ws.close(1008, 'Missing token or layoutId');
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      ws.close(1008, 'Invalid token');
      return;
    }

    const sessionId = `${payload.userId}-${layoutId}`;
    clients.set(sessionId, { ws, userId: payload.userId, layoutId });

    console.log(`✓ Client connected: ${sessionId}`);

    // Broadcast join event
    broadcastToLayout(layoutId, {
      type: 'collaborator:join',
      userId: payload.userId,
      timestamp: new Date(),
    });

    ws.on('message', (data: any) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'layout:update') {
          broadcastToLayout(layoutId, {
            ...message,
            userId: payload.userId,
            timestamp: new Date(),
          });
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });

    ws.on('close', () => {
      clients.delete(sessionId);
      console.log(`✗ Client disconnected: ${sessionId}`);

      broadcastToLayout(layoutId, {
        type: 'collaborator:leave',
        userId: payload.userId,
        timestamp: new Date(),
      });
    });

    ws.on('error', (err: any) => {
      console.error('WebSocket error:', err);
    });
  });
};

const broadcastToLayout = (layoutId: string, message: any) => {
  clients.forEach((client) => {
    if (client.layoutId === layoutId && client.ws.readyState === 1) {
      client.ws.send(JSON.stringify(message));
    }
  });
};
