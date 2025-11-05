import { Router, Request, Response } from 'express';
import { configDb } from '../db';

const router = Router();

// GET /api/config - Get all site config
router.get('/', (req: Request, res: Response) => {
  try {
    const configs = configDb.getAll();

    // Convert array to object for easier access
    const configObject = configs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {} as Record<string, string>);

    res.json({ success: true, data: configObject });
  } catch (error: any) {
    console.error('Error fetching site config:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch site config' });
  }
});

// GET /api/config/:key - Get single config value
router.get('/:key', (req: Request, res: Response) => {
  try {
    const config = configDb.getByKey(req.params.key);

    if (!config) {
      return res.status(404).json({ success: false, error: 'Config key not found' });
    }

    res.json({ success: true, data: config });
  } catch (error: any) {
    console.error('Error fetching config:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch config' });
  }
});

// PUT /api/config/:key - Update config value (admin only)
router.put('/:key', (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined || value === null) {
      return res.status(400).json({ success: false, error: 'Value is required' });
    }

    // Convert value to string if it's not already
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    const config = configDb.set(key, stringValue);
    res.json({ success: true, data: config });
  } catch (error: any) {
    console.error('Error updating config:', error);
    res.status(500).json({ success: false, error: 'Failed to update config' });
  }
});

// DELETE /api/config/:key - Delete config key (admin only)
router.delete('/:key', (req: Request, res: Response) => {
  try {
    const success = configDb.delete(req.params.key);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Config key not found' });
    }

    res.json({ success: true, message: 'Config key deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting config:', error);
    res.status(500).json({ success: false, error: 'Failed to delete config' });
  }
});

export default router;
