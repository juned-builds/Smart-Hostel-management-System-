import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Notice } from '../models/Notice.js';

// GET /api/notices - List all notices
export async function getNotices(req: Request, res: Response) {
  try {
    const { category, priority } = req.query;
    const query: any = { isActive: true };

    if (category && category !== 'All') query.category = category;
    if (priority && priority !== 'All') query.priority = priority;

    const notices = await Notice.find(query).sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      data: notices,
    });
  } catch (error: any) {
    console.error('getNotices error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notices.', error: error.message });
  }
}

// POST /api/notices - Create notice (Admin)
export async function createNotice(req: Request, res: Response) {
  try {
    const { title, content, category, priority, postedBy } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide notice title and content.' });
    }

    const notice = await Notice.create({
      title: title.trim(),
      content: content.trim(),
      category: category || 'General',
      priority: priority || 'Normal',
      postedBy: postedBy?.trim() || 'Hostel Rector / Warden',
    });

    return res.status(201).json({
      success: true,
      message: 'Notice published successfully.',
      data: notice,
    });
  } catch (error: any) {
    console.error('createNotice error:', error);
    return res.status(500).json({ success: false, message: 'Failed to publish notice.', error: error.message });
  }
}

// PUT /api/notices/:id - Update notice (Admin)
export async function updateNotice(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, content, category, priority, postedBy, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notice ID.' });
    }

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found.' });
    }

    if (title) notice.title = title.trim();
    if (content) notice.content = content.trim();
    if (category) notice.category = category;
    if (priority) notice.priority = priority;
    if (postedBy) notice.postedBy = postedBy.trim();
    if (isActive !== undefined) notice.isActive = Boolean(isActive);

    await notice.save();

    return res.json({
      success: true,
      message: 'Notice updated successfully.',
      data: notice,
    });
  } catch (error: any) {
    console.error('updateNotice error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notice.', error: error.message });
  }
}

// DELETE /api/notices/:id - Delete notice (Admin)
export async function deleteNotice(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notice ID.' });
    }

    const notice = await Notice.findByIdAndDelete(id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found.' });
    }

    return res.json({
      success: true,
      message: 'Notice removed successfully.',
    });
  } catch (error: any) {
    console.error('deleteNotice error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete notice.', error: error.message });
  }
}
