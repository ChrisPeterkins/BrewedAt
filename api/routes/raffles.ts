import { Router, Request, Response } from 'express';
import { rafflesDb, raffleEntriesDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================================================
// RAFFLES
// ============================================================================

// GET /api/raffles - List all raffles
router.get('/', (req: Request, res: Response) => {
  try {
    const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    const raffles = rafflesDb.getAll(active, limit, offset);
    res.json({ success: true, data: raffles });
  } catch (error: any) {
    console.error('Error fetching raffles:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch raffles' });
  }
});

// GET /api/raffles/:id - Get single raffle
router.get('/:id', (req: Request, res: Response) => {
  try {
    const raffle = rafflesDb.getById(req.params.id);

    if (!raffle) {
      return res.status(404).json({ success: false, error: 'Raffle not found' });
    }

    res.json({ success: true, data: raffle });
  } catch (error: any) {
    console.error('Error fetching raffle:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch raffle' });
  }
});

// POST /api/raffles - Create raffle (admin only)
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      imageUrl,
      prizeDetails,
      rules,
      active,
      winnerAnnounced
    } = req.body;

    // Validation
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'Title, start date, and end date are required' });
    }

    const raffle = rafflesDb.create({
      id: uuidv4(),
      title,
      description,
      startDate,
      endDate,
      imageUrl,
      prizeDetails,
      rules,
      active: active !== undefined ? (active ? 1 : 0) : 1,
      winnerAnnounced: winnerAnnounced ? 1 : 0
    });

    res.status(201).json({ success: true, data: raffle });
  } catch (error: any) {
    console.error('Error creating raffle:', error);
    res.status(500).json({ success: false, error: 'Failed to create raffle' });
  }
});

// PUT /api/raffles/:id - Update raffle (admin only)
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = {};

    // Only include fields that were provided
    const allowedFields = [
      'title',
      'description',
      'startDate',
      'endDate',
      'imageUrl',
      'prizeDetails',
      'rules',
      'active',
      'winnerAnnounced'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Convert boolean fields to integers if present
    if (updateData.active !== undefined) {
      updateData.active = updateData.active ? 1 : 0;
    }
    if (updateData.winnerAnnounced !== undefined) {
      updateData.winnerAnnounced = updateData.winnerAnnounced ? 1 : 0;
    }

    const success = rafflesDb.update(id, updateData);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Raffle not found' });
    }

    const updatedRaffle = rafflesDb.getById(id);
    res.json({ success: true, data: updatedRaffle });
  } catch (error: any) {
    console.error('Error updating raffle:', error);
    res.status(500).json({ success: false, error: 'Failed to update raffle' });
  }
});

// DELETE /api/raffles/:id - Delete raffle (admin only)
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = rafflesDb.delete(req.params.id);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Raffle not found' });
    }

    res.json({ success: true, message: 'Raffle deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting raffle:', error);
    res.status(500).json({ success: false, error: 'Failed to delete raffle' });
  }
});

// ============================================================================
// RAFFLE ENTRIES
// ============================================================================

// GET /api/raffles/:id/entries - List entries for a raffle (admin only)
router.get('/:id/entries', (req: Request, res: Response) => {
  try {
    const entries = raffleEntriesDb.getAllByRaffleId(req.params.id);
    res.json({ success: true, data: entries });
  } catch (error: any) {
    console.error('Error fetching raffle entries:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch raffle entries' });
  }
});

// POST /api/raffles/:id/enter - Submit raffle entry (public)
router.post('/:id/enter', (req: Request, res: Response) => {
  try {
    const { id: raffleId } = req.params;
    const { email, name, phone } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Check if raffle exists and is active
    const raffle = rafflesDb.getById(raffleId);
    if (!raffle) {
      return res.status(404).json({ success: false, error: 'Raffle not found' });
    }

    if (!raffle.active) {
      return res.status(400).json({ success: false, error: 'This raffle is no longer active' });
    }

    // Check if raffle has ended
    const now = new Date().toISOString();
    if (now > raffle.endDate) {
      return res.status(400).json({ success: false, error: 'This raffle has ended' });
    }

    // Create entry
    const entry = raffleEntriesDb.create({
      id: uuidv4(),
      raffleId,
      email,
      name,
      phone
    });

    res.status(201).json({ success: true, data: entry, message: 'Entry submitted successfully' });
  } catch (error: any) {
    console.error('Error submitting raffle entry:', error);

    // Handle duplicate entry error
    if (error.message === 'Email already entered for this raffle') {
      return res.status(409).json({ success: false, error: error.message });
    }

    res.status(500).json({ success: false, error: 'Failed to submit raffle entry' });
  }
});

export default router;
