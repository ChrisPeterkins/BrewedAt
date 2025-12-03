import { Router, Request, Response } from 'express';
import { tagsDb, eventTagsDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/tags - List all tags (optionally filter by category)
router.get('/', (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const tags = tagsDb.getAll(category);
    res.json({ success: true, data: tags });
  } catch (error: any) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tags' });
  }
});

// GET /api/tags/categories - List all tag categories
router.get('/categories', (req: Request, res: Response) => {
  try {
    const categories = tagsDb.getCategories();
    res.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('Error fetching tag categories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tag categories' });
  }
});

// GET /api/tags/:id - Get single tag
router.get('/:id', (req: Request, res: Response) => {
  try {
    const tag = tagsDb.getById(req.params.id);

    if (!tag) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }

    res.json({ success: true, data: tag });
  } catch (error: any) {
    console.error('Error fetching tag:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tag' });
  }
});

// POST /api/tags - Create tag (admin only)
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, category, color } = req.body;

    // Validation
    if (!name || !category) {
      return res.status(400).json({ success: false, error: 'Name and category are required' });
    }

    // Generate a slug-like ID
    const id = `tag-${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;

    const tag = tagsDb.create({
      id,
      name,
      category,
      color,
    });

    res.status(201).json({ success: true, data: tag });
  } catch (error: any) {
    console.error('Error creating tag:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ success: false, error: 'Tag with this name already exists in this category' });
    }
    res.status(500).json({ success: false, error: 'Failed to create tag' });
  }
});

// PUT /api/tags/:id - Update tag (admin only)
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = {};

    // Only include fields that were provided
    const allowedFields = ['name', 'category', 'color'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const success = tagsDb.update(id, updateData);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }

    const updatedTag = tagsDb.getById(id);
    res.json({ success: true, data: updatedTag });
  } catch (error: any) {
    console.error('Error updating tag:', error);
    res.status(500).json({ success: false, error: 'Failed to update tag' });
  }
});

// DELETE /api/tags/:id - Delete tag (admin only)
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = tagsDb.delete(req.params.id);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }

    res.json({ success: true, message: 'Tag deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ success: false, error: 'Failed to delete tag' });
  }
});

export default router;
