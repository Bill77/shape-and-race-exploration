import type { Config } from 'drizzle-kit';

export default {
  schema: './apps/shape-n-race/src/lib/db/schema.ts',
  out: './apps/shape-n-race/drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL?.replace('file:', '') || './apps/shape-n-race/local.db',
  },
} satisfies Config;
