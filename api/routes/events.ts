import { Router, Request, Response } from 'express';
import { eventsDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/events - List all events
router.get('/', (req: Request, res: Response) => {
  try {
    const featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    const events = eventsDb.getAll(featured, limit, offset);
    res.json({ success: true, data: events });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', (req: Request, res: Response) => {
  try {
    const event = eventsDb.getById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    res.json({ success: true, data: event });
  } catch (error: any) {
    console.error('Error fetching event:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch event' });
  }
});

// POST /api/events - Create event (admin only - auth middleware should be applied in server.ts)
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, description, date, time, location, brewery, breweryLogo, eventType, imageUrl, externalUrl, featured } = req.body;

    // Validation
    if (!title || !date) {
      return res.status(400).json({ success: false, error: 'Title and date are required' });
    }

    const event = eventsDb.create({
      id: uuidv4(),
      title,
      description,
      date,
      time,
      location,
      brewery,
      breweryLogo,
      eventType,
      imageUrl,
      externalUrl,
      featured: featured ? 1 : 0
    });

    res.status(201).json({ success: true, data: event });
  } catch (error: any) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, error: 'Failed to create event' });
  }
});

// PUT /api/events/:id - Update event (admin only)
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = {};

    // Only include fields that were provided
    const allowedFields = ['title', 'description', 'date', 'time', 'location', 'brewery',
                          'breweryLogo', 'eventType', 'imageUrl', 'externalUrl', 'featured'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Convert featured to integer if present
    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured ? 1 : 0;
    }

    const success = eventsDb.update(id, updateData);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const updatedEvent = eventsDb.getById(id);
    res.json({ success: true, data: updatedEvent });
  } catch (error: any) {
    console.error('Error updating event:', error);
    res.status(500).json({ success: false, error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - Delete event (admin only)
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = eventsDb.delete(req.params.id);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    res.status(500).json({ success: false, error: 'Failed to delete event' });
  }
});

export default router;
