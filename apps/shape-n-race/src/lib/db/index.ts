import path from 'path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Get database path from environment or use default
// For Vercel/production, DATABASE_URL will be a connection string
// For local development, use SQLite file in this app's directory (monorepo-friendly)
const getDbPath = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && dbUrl.startsWith('file:')) {
    const relative = dbUrl.replace('file:', '').trim();
    return path.isAbsolute(relative) ? relative : path.resolve(process.cwd(), relative);
  }
  if (dbUrl) {
    return path.isAbsolute(dbUrl) ? dbUrl : path.resolve(process.cwd(), dbUrl);
  }
  // Default: local.db in this app's directory (works for cwd = workspace root or app dir)
  const cwd = process.cwd();
  const appDir = path.join(cwd, 'apps', 'shape-n-race');
  const inAppDir = cwd.endsWith('shape-n-race') || cwd === appDir;
  return inAppDir ? path.join(cwd, 'local.db') : path.join(appDir, 'local.db');
};

const dbPath = getDbPath();

// Create SQLite database connection
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

export { schema };
