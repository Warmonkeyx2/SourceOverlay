import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'layouts.db');
let db: any = null;
let SQL: any = null;

const ensureSQL = async () => {
  if (!SQL) {
    SQL = await initSqlJs();
  }
};

export const initDb = async () => {
  await ensureSQL();
  
  // Load existing database or create new one
  let data = null;
  if (fs.existsSync(dbPath)) {
    data = fs.readFileSync(dbPath);
  }
  
  db = data ? new SQL.Database(data) : new SQL.Database();
  
  // Create users table
  const usersExists = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
  );
  
  if (usersExists.length === 0) {
    db.run(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        username TEXT NOT NULL,
        profile_icon TEXT,
        email_verified INTEGER DEFAULT 0,
        verification_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    db.run(`
      CREATE TABLE sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    db.run(`
      CREATE TABLE layouts (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        title TEXT NOT NULL,
        bg_color TEXT DEFAULT '#0d1117',
        data TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id)
      )
    `);
    
    db.run(`
      CREATE TABLE layout_permissions (
        id TEXT PRIMARY KEY,
        layout_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        permission_level TEXT DEFAULT 'can_view',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (layout_id) REFERENCES layouts(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(layout_id, user_id)
      )
    `);
    
    db.run(`
      CREATE TABLE layout_collaborators (
        id TEXT PRIMARY KEY,
        layout_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        is_editing INTEGER DEFAULT 0,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (layout_id) REFERENCES layouts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    db.run(`
      CREATE TABLE invites (
        id TEXT PRIMARY KEY,
        from_user_id TEXT NOT NULL,
        to_user_id TEXT,
        to_email TEXT,
        layout_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_user_id) REFERENCES users(id),
        FOREIGN KEY (to_user_id) REFERENCES users(id),
        FOREIGN KEY (layout_id) REFERENCES layouts(id)
      )
    `);
    
    saveDb();
    console.log('✓ Database initialized with multi-user tables');
  }
};

const saveDb = () => {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
};

export const query = async (sql: string, params: any[] = []) => {
  if (!db) throw new Error('Database not initialized');
  
  try {
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return { rows };
    } else {
      db.run(sql, params);
      saveDb();
      return { rows: [] };
    }
  } catch (err: any) {
    throw new Error(`Database query error: ${err.message}`);
  }
};

export const connect = async () => {
  try {
    await initDb();
    console.log('✓ Database connected');
  } catch (err) {
    console.error('✗ Database connection failed:', err);
    process.exit(1);
  }
};

export const closeDb = () => {
  if (db) {
    saveDb();
    db.close();
  }
};

export default db;
