import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

let pgClient: Client | null = null;

export async function initializePostgresDB() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required for production');
  }

  pgClient = new Client({ connectionString });
  await pgClient.connect();
  console.log('PostgreSQL connected');

  // Run migrations
  await runMigrations();
}

async function runMigrations() {
  if (!pgClient) throw new Error('Database not initialized');

  // Create tables if they don't exist
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      email_verified BOOLEAN DEFAULT FALSE,
      mfa_enabled BOOLEAN DEFAULT FALSE,
      mfa_secret VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS layouts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      bg_color VARCHAR(10) DEFAULT '#000000',
      data TEXT DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS layout_permissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      layout_id UUID REFERENCES layouts(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      can_edit BOOLEAN DEFAULT FALSE,
      can_delete BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(layout_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS layout_collaborators (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      layout_id UUID REFERENCES layouts(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(50) DEFAULT 'viewer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(layout_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS invites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      to_email VARCHAR(255),
      layout_id UUID REFERENCES layouts(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_layouts_owner ON layouts(owner_id);
    CREATE INDEX IF NOT EXISTS idx_permissions_layout ON layout_permissions(layout_id);
    CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
    CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(to_email);
  `);

  console.log('Database migrations completed');
}

export async function queryDB(sql: string, params?: any[]): Promise<any> {
  if (!pgClient) throw new Error('Database not initialized');
  try {
    const result = await pgClient.query(sql, params);
    return { rows: result.rows };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function runDB(sql: string, params?: any[]): Promise<any> {
  return queryDB(sql, params);
}

export async function closeDB() {
  if (pgClient) {
    await pgClient.end();
    pgClient = null;
    console.log('PostgreSQL connection closed');
  }
}
