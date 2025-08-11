import { Request, Response } from 'express';
import { supabase as db } from '../db';
import {
  insertCalendarEventSchema,
  updateCalendarEventSchema,
  CalendarEventInput,
} from '@shared/schema';

/**
 * GET /api/events?from=ISO&to=ISO
 */
export async function listEvents(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const from = typeof req.query.from === 'string' ? req.query.from : undefined;
    const to = typeof req.query.to === 'string' ? req.query.to : undefined;

    let query = db.from('events')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('start_time', { ascending: true });

    // Basic range (events starting within interval). Overlap logic can be added later.
    if (from) query = query.gte('start_time', from);
    if (to) query = query.lte('start_time', to);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('List events error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
}

/**
 * POST /api/events
 */
export async function createEvent(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const body = insertCalendarEventSchema.parse({ ...req.body } as CalendarEventInput);

    const payload = {
      user_id: req.user.userId,
      title: body.title,
      description: body.description ?? null,
      start_time: body.startTime,
      end_time: body.endTime,
      timezone: body.timezone,
      location: body.location ?? null,
      is_all_day: body.isAllDay ?? false,
    };

    const { data, error } = await db.from('events').insert(payload).select('*').single();
    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error: any) {
    if (error?.issues) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues });
      return;
    }
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
}

/**
 * PATCH /api/events/:id
 */
export async function updateEvent(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const id = req.params.id;
    const body = updateCalendarEventSchema.parse(req.body ?? {});

    const updatePayload: Record<string, any> = {};
    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.startTime !== undefined) updatePayload.start_time = body.startTime;
    if (body.endTime !== undefined) updatePayload.end_time = body.endTime;
    if (body.timezone !== undefined) updatePayload.timezone = body.timezone;
    if (body.location !== undefined) updatePayload.location = body.location;
    if (body.isAllDay !== undefined) updatePayload.is_all_day = body.isAllDay;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await db
      .from('events')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .select('*')
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    if (error?.issues) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues });
      return;
    }
    console.error('Update event error:', error);
    res.status(500).json({ success: false, message: 'Failed to update event' });
  }
}

/**
 * DELETE /api/events/:id
 */
export async function deleteEvent(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const id = req.params.id;
    const { error } = await db
      .from('events')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.userId);

    if (error) throw error;

    res.json({ success: true, message: 'Event deleted' });
  } catch (error: any) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
}


