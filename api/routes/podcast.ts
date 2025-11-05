import { Router, Request, Response } from 'express';
import { podcastDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/podcast - List all episodes
router.get('/', (req: Request, res: Response) => {
  try {
    const featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    const episodes = podcastDb.getAll(featured, limit, offset);
    res.json({ success: true, data: episodes });
  } catch (error: any) {
    console.error('Error fetching podcast episodes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch podcast episodes' });
  }
});

// GET /api/podcast/:id - Get single episode
router.get('/:id', (req: Request, res: Response) => {
  try {
    const episode = podcastDb.getById(req.params.id);

    if (!episode) {
      return res.status(404).json({ success: false, error: 'Episode not found' });
    }

    res.json({ success: true, data: episode });
  } catch (error: any) {
    console.error('Error fetching episode:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch episode' });
  }
});

// POST /api/podcast - Create episode (admin only)
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      publishDate,
      duration,
      audioUrl,
      imageUrl,
      spotifyUrl,
      appleUrl,
      youtubeUrl,
      featured
    } = req.body;

    // Validation
    if (!title || !publishDate) {
      return res.status(400).json({ success: false, error: 'Title and publish date are required' });
    }

    const episode = podcastDb.create({
      id: uuidv4(),
      title,
      description,
      publishDate,
      duration,
      audioUrl,
      imageUrl,
      spotifyUrl,
      appleUrl,
      youtubeUrl,
      featured: featured ? 1 : 0
    });

    res.status(201).json({ success: true, data: episode });
  } catch (error: any) {
    console.error('Error creating episode:', error);
    res.status(500).json({ success: false, error: 'Failed to create episode' });
  }
});

// PUT /api/podcast/:id - Update episode (admin only)
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = {};

    // Only include fields that were provided
    const allowedFields = [
      'title',
      'description',
      'publishDate',
      'duration',
      'audioUrl',
      'imageUrl',
      'spotifyUrl',
      'appleUrl',
      'youtubeUrl',
      'featured'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Convert featured to integer if present
    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured ? 1 : 0;
    }

    const success = podcastDb.update(id, updateData);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Episode not found' });
    }

    const updatedEpisode = podcastDb.getById(id);
    res.json({ success: true, data: updatedEpisode });
  } catch (error: any) {
    console.error('Error updating episode:', error);
    res.status(500).json({ success: false, error: 'Failed to update episode' });
  }
});

// DELETE /api/podcast/:id - Delete episode (admin only)
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = podcastDb.delete(req.params.id);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Episode not found' });
    }

    res.json({ success: true, message: 'Episode deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting episode:', error);
    res.status(500).json({ success: false, error: 'Failed to delete episode' });
  }
});

export default router;
