import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Get database path from environment or use default
// For Vercel/production, DATABASE_URL will be a connection string
// For local development, use SQLite file
const getDbPath = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return './local.db';
  }
  // If it's a file: URL, extract the path
  if (dbUrl.startsWith('file:')) {
    return dbUrl.replace('file:', '');
  }
  // For production databases (Turso, etc.), this will be handled differently
  // For now, fallback to local.db
  return './local.db';
};

const dbPath = getDbPath();

// Create SQLite database connection
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

export { schema };
