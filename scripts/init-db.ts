import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../apps/shape-n-race/src/lib/db/schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './local.db';
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

// Run migrations
migrate(db, { migrationsFolder: './apps/shape-n-race/drizzle' });

console.log('Database initialized successfully!');
sqlite.close();
