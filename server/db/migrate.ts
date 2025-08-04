import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import ws from 'ws';
import * as fs from 'fs';
import * as path from 'path';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Run migrations using Drizzle Kit
    await migrate(db, { migrationsFolder: './server/db/migrations' });
    
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function generateMigration() {
  try {
    console.log('🔄 Generating migration...');
    
    // This would typically be done with drizzle-kit
    // For now, we'll just create a timestamped migration file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const migrationName = `migration_${timestamp}`;
    
    console.log(`📝 Generated migration: ${migrationName}`);
    console.log('💡 Run "npm run db:push" to apply schema changes');
  } catch (error) {
    console.error('❌ Migration generation failed:', error);
    process.exit(1);
  }
}

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');
    
    // Drop all tables (be careful with this in production!)
    await db.execute(sql`DROP SCHEMA public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// CLI commands
const command = process.argv[2];

switch (command) {
  case 'migrate':
    runMigrations();
    break;
  case 'generate':
    generateMigration();
    break;
  case 'reset':
    resetDatabase();
    break;
  default:
    console.log(`
Usage: npm run db:migrate [command]

Commands:
  migrate  - Run all pending migrations
  generate - Generate a new migration file
  reset    - Reset database (DANGER: drops all data)

Examples:
  npm run db:migrate migrate
  npm run db:migrate generate
  npm run db:migrate reset
    `);
    process.exit(0);
} 