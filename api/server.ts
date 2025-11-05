import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import eventsRouter from './routes/events';
import podcastRouter from './routes/podcast';
import rafflesRouter from './routes/raffles';
import contactRouter from './routes/contact';
import configRouter from './routes/config';

// Import middleware
import { authenticateToken, requireAdmin, login } from './middleware/auth';
import {
  uploadEventImage,
  uploadPodcastImage,
  uploadRaffleImage,
  getFileUrl
} from './middleware/upload';

const app = express();
const PORT = process.env.PORT || 3005;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// POST /api/auth/login - Admin login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await login(email, password);

    if (!result) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// GET /api/auth/verify - Verify token
app.get('/api/auth/verify', authenticateToken, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: req.user
  });
});

// POST /api/auth/logout - Logout (client-side token deletion)
app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ============================================================================
// PUBLIC ROUTES (no authentication required)
// ============================================================================

// Events (public can read)
app.use('/api/events', eventsRouter);

// Podcast (public can read)
app.use('/api/podcast', podcastRouter);

// Raffles (public can read and enter)
app.use('/api/raffles', rafflesRouter);

// Contact (public can submit)
app.use('/api/contact', contactRouter);

// Config (public can read)
app.use('/api/config', configRouter);

// ============================================================================
// IMAGE UPLOAD ROUTES (admin only)
// ============================================================================

// Upload event image
app.post('/api/events/:id/image',
  authenticateToken,
  requireAdmin,
  uploadEventImage.single('image'),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const imageUrl = getFileUrl(req, req.file);
      res.json({
        success: true,
        data: { imageUrl }
      });
    } catch (error: any) {
      console.error('Error uploading event image:', error);
      res.status(500).json({ success: false, error: 'Failed to upload image' });
    }
  }
);

// Upload podcast image
app.post('/api/podcast/:id/image',
  authenticateToken,
  requireAdmin,
  uploadPodcastImage.single('image'),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const imageUrl = getFileUrl(req, req.file);
      res.json({
        success: true,
        data: { imageUrl }
      });
    } catch (error: any) {
      console.error('Error uploading podcast image:', error);
      res.status(500).json({ success: false, error: 'Failed to upload image' });
    }
  }
);

// Upload raffle image
app.post('/api/raffles/:id/image',
  authenticateToken,
  requireAdmin,
  uploadRaffleImage.single('image'),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const imageUrl = getFileUrl(req, req.file);
      res.json({
        success: true,
        data: { imageUrl }
      });
    } catch (error: any) {
      console.error('Error uploading raffle image:', error);
      res.status(500).json({ success: false, error: 'Failed to upload image' });
    }
  }
);

// ============================================================================
// CUSTOM SQL QUERY (admin only - for db-viewer)
// ============================================================================

app.post('/api/query',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { sql } = req.body;

      if (!sql || typeof sql !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'SQL query is required'
        });
      }

      // Security: Only allow SELECT queries
      const trimmedSql = sql.trim().toLowerCase();
      if (!trimmedSql.startsWith('select')) {
        return res.status(403).json({
          success: false,
          error: 'Only SELECT queries are allowed'
        });
      }

      // Prevent dangerous SQL operations
      const dangerousKeywords = ['drop', 'delete', 'update', 'insert', 'alter', 'create', 'truncate', 'pragma'];
      for (const keyword of dangerousKeywords) {
        if (trimmedSql.includes(keyword)) {
          return res.status(403).json({
            success: false,
            error: `SQL keyword '${keyword.toUpperCase()}' is not allowed`
          });
        }
      }

      // Import db at the top if not already imported
      const db = (await import('./db.js')).default;

      // Execute the query
      const result = db.prepare(sql).all();

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Query error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Query execution failed'
      });
    }
  }
);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);

  // Multer errors
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  if (err.message.includes('File too large')) {
    return res.status(400).json({
      success: false,
      error: 'File size exceeds 5MB limit'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   BrewedAt API Server Started        ║
  ╠══════════════════════════════════════╣
  ║   Port: ${PORT}                      ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}
  ║   Database: brewedat.db              ║
  ╚══════════════════════════════════════╝
  `);

  console.log('📡 Available endpoints:');
  console.log('   Authentication:');
  console.log('     POST   /api/auth/login');
  console.log('     GET    /api/auth/verify');
  console.log('     POST   /api/auth/logout');
  console.log('   Events:');
  console.log('     GET    /api/events');
  console.log('     GET    /api/events/:id');
  console.log('     POST   /api/events (admin)');
  console.log('     PUT    /api/events/:id (admin)');
  console.log('     DELETE /api/events/:id (admin)');
  console.log('     POST   /api/events/:id/image (admin)');
  console.log('   Podcast:');
  console.log('     GET    /api/podcast');
  console.log('     GET    /api/podcast/:id');
  console.log('     POST   /api/podcast (admin)');
  console.log('     PUT    /api/podcast/:id (admin)');
  console.log('     DELETE /api/podcast/:id (admin)');
  console.log('     POST   /api/podcast/:id/image (admin)');
  console.log('   Raffles:');
  console.log('     GET    /api/raffles');
  console.log('     GET    /api/raffles/:id');
  console.log('     POST   /api/raffles (admin)');
  console.log('     PUT    /api/raffles/:id (admin)');
  console.log('     DELETE /api/raffles/:id (admin)');
  console.log('     POST   /api/raffles/:id/image (admin)');
  console.log('     POST   /api/raffles/:id/enter (public)');
  console.log('     GET    /api/raffles/:id/entries (admin)');
  console.log('   Contact:');
  console.log('     POST   /api/contact (public)');
  console.log('     GET    /api/contact (admin)');
  console.log('     DELETE /api/contact/:id (admin)');
  console.log('   Config:');
  console.log('     GET    /api/config');
  console.log('     GET    /api/config/:key');
  console.log('     PUT    /api/config/:key (admin)');
  console.log('     DELETE /api/config/:key (admin)');
  console.log('');
});

export default app;
