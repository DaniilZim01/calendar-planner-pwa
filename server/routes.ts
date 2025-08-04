import type { Express } from "express";
import { createServer, type Server } from "http";
import authRoutes from "./routes/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.use('/api/auth', authRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
