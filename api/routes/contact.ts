import { Router, Request, Response } from 'express';
import { contactDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/contact - List all contact submissions (admin only)
router.get('/', (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    const submissions = contactDb.getAll(limit, offset);
    res.json({ success: true, data: submissions });
  } catch (error: any) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch contact submissions' });
  }
});

// GET /api/contact/:id - Get single contact submission (admin only)
router.get('/:id', (req: Request, res: Response) => {
  try {
    const submission = contactDb.getById(req.params.id);

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Contact submission not found' });
    }

    res.json({ success: true, data: submission });
  } catch (error: any) {
    console.error('Error fetching contact submission:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch contact submission' });
  }
});

// POST /api/contact - Submit contact form (public)
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, email, message, audienceType } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    const submission = contactDb.create({
      id: uuidv4(),
      name,
      email,
      message,
      audienceType
    });

    res.status(201).json({
      success: true,
      data: submission,
      message: 'Contact form submitted successfully'
    });
  } catch (error: any) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ success: false, error: 'Failed to submit contact form' });
  }
});

// DELETE /api/contact/:id - Delete contact submission (admin only)
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = contactDb.delete(req.params.id);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Contact submission not found' });
    }

    res.json({ success: true, message: 'Contact submission deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting contact submission:', error);
    res.status(500).json({ success: false, error: 'Failed to delete contact submission' });
  }
});

export default router;
