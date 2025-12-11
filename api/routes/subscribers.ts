import { Router, Request, Response } from 'express';
import { subscribersDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5; // 5 subscriptions per hour per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count++;
  return false;
}

// GET /api/subscribers - List all subscribers (admin only)
router.get('/', (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    const subscribers = subscribersDb.getAll(limit, offset);
    const count = subscribersDb.getCount();

    res.json({
      success: true,
      data: subscribers,
      meta: {
        total: count,
        activeCount: count
      }
    });
  } catch (error: any) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch subscribers' });
  }
});

// GET /api/subscribers/count - Get subscriber count (admin only)
router.get('/count', (req: Request, res: Response) => {
  try {
    const count = subscribersDb.getCount();
    res.json({ success: true, data: { count } });
  } catch (error: any) {
    console.error('Error fetching subscriber count:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch subscriber count' });
  }
});

// POST /api/subscribers - Subscribe (public)
router.post('/', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    // Rate limiting
    if (isRateLimited(ip)) {
      return res.status(429).json({
        success: false,
        error: 'Too many subscription attempts. Please try again later.'
      });
    }

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    // Check if already subscribed
    const existing = subscribersDb.getByEmail(email);
    if (existing) {
      if (existing.unsubscribedAt) {
        // Resubscribe
        subscribersDb.resubscribe(email);
        return res.json({
          success: true,
          message: 'Welcome back! You have been resubscribed.'
        });
      }
      return res.status(400).json({
        success: false,
        error: 'This email is already subscribed'
      });
    }

    const subscriber = subscribersDb.create({
      id: uuidv4(),
      email,
      source: 'website',
      ipAddress: ip
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed!'
    });
  } catch (error: any) {
    console.error('Error subscribing:', error);
    if (error.message === 'Email already subscribed') {
      return res.status(400).json({ success: false, error: 'This email is already subscribed' });
    }
    res.status(500).json({ success: false, error: 'Failed to subscribe' });
  }
});

// POST /api/subscribers/unsubscribe - Unsubscribe (public)
router.post('/unsubscribe', (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const success = subscribersDb.unsubscribe(email);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Email not found or already unsubscribed'
      });
    }

    res.json({
      success: true,
      message: 'Successfully unsubscribed'
    });
  } catch (error: any) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ success: false, error: 'Failed to unsubscribe' });
  }
});

// DELETE /api/subscribers/:id - Delete subscriber (admin only)
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = subscribersDb.delete(req.params.id);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Subscriber not found' });
    }

    res.json({ success: true, message: 'Subscriber deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ success: false, error: 'Failed to delete subscriber' });
  }
});

export default router;
