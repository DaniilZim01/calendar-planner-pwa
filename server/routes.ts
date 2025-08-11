import type { Express } from "express";
import { createServer, type Server } from "http";
import authRoutes from "./routes/auth";
import eventRoutes from "./routes/events";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventRoutes);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
