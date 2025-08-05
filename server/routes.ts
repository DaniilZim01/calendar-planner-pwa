import type { Express } from "express";
import { createServer, type Server } from "http";
import { sql } from "drizzle-orm";
// import authRoutes from "./routes/auth"; // temporarily disabled
import { supabase } from "./db/index.ts";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - temporarily disabled until auth is fixed
  // app.use('/api/auth', authRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Database test endpoint
  app.get('/api/test-db', async (req, res) => {
    try {
      // Test Supabase connection
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      const result = { success: true, message: 'Database connection successful' };
      
      if (result.success) {
        res.json({
          status: 'success',
          message: result.message,
          timestamp: new Date().toISOString(),
          database: 'Supabase',
          supabaseUrl: process.env.SUPABASE_URL ? 'Configured' : 'Not configured'
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: result.message,
          timestamp: new Date().toISOString(),
          database: 'Supabase',
          supabaseUrl: process.env.SUPABASE_URL ? 'Configured' : 'Not configured'
        });
      }
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        database: 'Supabase',
        supabaseUrl: process.env.SUPABASE_URL ? 'Configured' : 'Not configured'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
