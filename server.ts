import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { connectDB } from './server/config/db.js';
import { seedDatabase } from './server/seed/seedData.js';

import authRoutes from './server/routes/authRoutes.js';
import studentRoutes from './server/routes/studentRoutes.js';
import roomRoutes, { allocationRouter } from './server/routes/roomRoutes.js';
import complaintRoutes from './server/routes/complaintRoutes.js';
import leaveRoutes from './server/routes/leaveRoutes.js';
import feeRoutes from './server/routes/feeRoutes.js';
import noticeRoutes from './server/routes/noticeRoutes.js';
import dashboardRoutes from './server/routes/dashboardRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const app = express();

  // Core middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Connect to Database and Seed
  try {
    const dbUri = await connectDB();
    console.log(`[HostelApp] Database connected successfully.`);
    await seedDatabase(false);
  } catch (error) {
    console.error(`[HostelApp] Database connection error:`, error);
  }

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      app: 'Smart Hostel Management System',
      university: 'Gujarat Technological University (GTU)',
      timestamp: new Date().toISOString(),
    });
  });

  // Database Reset Endpoint (Viva Demonstration Helper)
  app.post('/api/seed/reset', async (req: Request, res: Response) => {
    try {
      await seedDatabase(true);
      return res.json({ success: true, message: 'Database reset to default GTU demo records successfully.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to reset database.', error: err.message });
    }
  });

  // Mount REST API endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/rooms', roomRoutes);
  app.use('/api/allocations', allocationRouter);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/leaves', leaveRoutes);
  app.use('/api/fees', feeRoutes);
  app.use('/api/notices', noticeRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // Global error handler for API routes
  app.use('/api', (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[API Error]:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });

  // Frontend integration: Vite middleware in dev, static files in production
  if (!isProduction) {
    console.log(`[HostelApp] Setting up Vite dev middleware...`);
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` SMART HOSTEL MANAGEMENT SYSTEM (GTU Academic Portal)`);
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Admin Demo:   admin@hostel.com   / admin123`);
    console.log(` Student Demo: student@hostel.com / student123`);
    console.log(`=======================================================`);
  });
}

bootstrap().catch((err) => {
  console.error(`[HostelApp] Fatal error during startup:`, err);
  process.exit(1);
});
