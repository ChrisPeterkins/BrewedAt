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
import tagsRouter from './routes/tags';
import subscribersRouter from './routes/subscribers';

// Import middleware
import { authenticateToken, requireAdmin, login } from './middleware/auth';
import {
  uploadEventImage,
  uploadPodcastImage,
  uploadRaffleImage,
  uploadImage,
  uploadDocument,
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

// Serve uploaded files statically
app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));

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

// Tags (public can read)
app.use('/api/tags', tagsRouter);

// Subscribers (public can subscribe, admin can view)
app.use('/api/subscribers', subscribersRouter);

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

// Upload general image (for media library)
app.post('/api/upload/image',
  authenticateToken,
  requireAdmin,
  uploadImage.single('image'),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const imageUrl = getFileUrl(req, req.file);
      res.json({
        success: true,
        data: {
          imageUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          uploadedAt: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      res.status(500).json({ success: false, error: 'Failed to upload image' });
    }
  }
);

// ============================================================================
// DOCUMENT MANAGEMENT ROUTES (admin only)
// ============================================================================

// Upload document
app.post('/api/upload/document',
  authenticateToken,
  requireAdmin,
  uploadDocument.single('document'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const { v4: uuidv4 } = await import('uuid');
      const db = (await import('./db.js')).default;
      const documentUrl = getFileUrl(req, req.file);
      const documentId = uuidv4();

      // Save document metadata to database
      db.prepare(`
        INSERT INTO documents (id, filename, original_name, file_type, file_size, file_url, uploaded_by, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        documentId,
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        documentUrl,
        req.user!.email,
        req.body.description || null
      );

      res.json({
        success: true,
        data: {
          id: documentId,
          documentUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          fileType: req.file.mimetype,
          size: req.file.size,
          uploadedAt: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Error uploading document:', error);
      res.status(500).json({ success: false, error: 'Failed to upload document' });
    }
  }
);

// Get all documents
app.get('/api/documents',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const db = (await import('./db.js')).default;
      const documents = db.prepare('SELECT * FROM documents ORDER BY created_at DESC').all();

      res.json({
        success: true,
        data: documents
      });
    } catch (error: any) {
      console.error('Error getting documents:', error);
      res.status(500).json({ success: false, error: 'Failed to get documents' });
    }
  }
);

// Delete document
app.delete('/api/documents/:id',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const db = (await import('./db.js')).default;
      const fs = await import('fs');
      const path = await import('path');

      // Get document info
      const document = db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as any;

      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      // Delete file from filesystem
      const filePath = path.join(process.cwd(), 'uploads', 'documents', document.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from database
      db.prepare('DELETE FROM documents WHERE id = ?').run(id);

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting document:', error);
      res.status(500).json({ success: false, error: 'Failed to delete document' });
    }
  }
);

// ============================================================================
// USER MANAGEMENT ROUTES (admin only)
// ============================================================================

// Get all users
app.get('/api/users',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { usersDb } = await import('./db.js');
      const users = usersDb.getAll();

      // Remove password hashes from response
      const usersWithoutPasswords = users.map(({ passwordHash, ...user }) => user);

      res.json({
        success: true,
        data: usersWithoutPasswords
      });
    } catch (error: any) {
      console.error('Error getting users:', error);
      res.status(500).json({ success: false, error: 'Failed to get users' });
    }
  }
);

// Create new user
app.post('/api/users',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { email, password, displayName, role, sendEmail } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const { usersDb } = await import('./db.js');
      const { hashPassword } = await import('./middleware/auth.js');
      const { v4: uuidv4 } = await import('uuid');

      // Check if user already exists
      const existingUser = usersDb.getByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const newUser = usersDb.create({
        id: uuidv4(),
        email,
        displayName: displayName || undefined,
        photoUrl: undefined,
        role: role || 'admin',
        passwordHash
      });

      // Send welcome email if requested
      let emailSent = false;
      if (sendEmail) {
        const { sendWelcomeEmail } = await import('./utils/email.js');
        emailSent = await sendWelcomeEmail(email, displayName || email, password);
      }

      // Remove password hash from response
      const { passwordHash: _, ...userWithoutPassword } = newUser;

      res.json({
        success: true,
        data: {
          ...userWithoutPassword,
          emailSent
        }
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(500).json({ success: false, error: 'Failed to create user' });
    }
  }
);

// Change password
app.post('/api/users/change-password',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 6 characters'
        });
      }

      const { usersDb } = await import('./db.js');
      const bcrypt = await import('bcrypt');
      const { hashPassword } = await import('./middleware/auth.js');

      // Get user
      const user = usersDb.getById(userId);
      if (!user || !user.passwordHash) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password
      usersDb.updatePassword(userId, newPasswordHash);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      res.status(500).json({ success: false, error: 'Failed to change password' });
    }
  }
);

// Delete user
app.delete('/api/users/:id',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Prevent deleting yourself
      if (id === req.user!.id) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete your own account'
        });
      }

      const { usersDb } = await import('./db.js');
      const deleted = usersDb.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
  }
);

// ============================================================================
// EMAIL LOGS (admin only)
// ============================================================================

// Get email logs
app.get('/api/email-logs',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { limit = '50', offset = '0' } = req.query;
      const db = (await import('./db.js')).default;

      const logs = db.prepare(`
        SELECT * FROM email_logs
        ORDER BY sent_at DESC
        LIMIT ? OFFSET ?
      `).all(parseInt(limit as string), parseInt(offset as string));

      const total = db.prepare('SELECT COUNT(*) as count FROM email_logs').get() as { count: number };

      res.json({
        success: true,
        data: {
          logs,
          total: total.count
        }
      });
    } catch (error: any) {
      console.error('Error getting email logs:', error);
      res.status(500).json({ success: false, error: 'Failed to get email logs' });
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
