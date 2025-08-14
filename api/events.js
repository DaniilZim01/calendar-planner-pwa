import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { authenticateToken } from '../server/lib/auth.js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://doirvgumddwncxujbosb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaXJ2Z3VtZGR3bmN4dWpib3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzYwMzcsImV4cCI6MjA2OTkxMjAzN30.q0vEL3ddgd4j9S639Jdbr6l1YU_ucaRxTJlMQrasX3s';
const supabase = createClient(supabaseUrl, supabaseKey);

// Zod schemas
const insertSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  startTime: z.string().datetime({ offset: true }),
  endTime: z.string().datetime({ offset: true }),
  timezone: z.string().min(1),
  location: z.string().optional().nullable(),
  isAllDay: z.boolean().optional().default(false),
  
}).refine((val) => new Date(val.endTime).getTime() > new Date(val.startTime).getTime(), {
  message: 'endTime must be greater than startTime',
  path: ['endTime'],
});

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  startTime: z.string().datetime({ offset: true }).optional(),
  endTime: z.string().datetime({ offset: true }).optional(),
  timezone: z.string().min(1).optional(),
  location: z.string().optional().nullable(),
  isAllDay: z.boolean().optional(),
  
}).refine((val) => {
  if (!val.startTime || !val.endTime) return true;
  return new Date(val.endTime).getTime() > new Date(val.startTime).getTime();
}, {
  message: 'endTime must be greater than startTime',
  path: ['endTime'],
});

export default async function handler(req, res) {
  // Auth
  try {
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (error) => (error ? reject(error) : resolve()));
    });
  } catch (error) {
    const status = error.status || 401;
    return res.status(status).json({ success: false, message: error.message || 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const from = (req.query?.from || '').toString() || undefined;
      const to = (req.query?.to || '').toString() || undefined;

      let query = supabase
        .from('events')
        .select('id, user_id, title, description, start_time, end_time, timezone, location, is_all_day, created_at, updated_at')
        .eq('user_id', req.user.userId)
        .order('start_time', { ascending: true });

      if (from) query = query.gte('start_time', from);
      if (to) query = query.lte('start_time', to);

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json({ success: true, data: data || [] });
    } catch (error) {
      console.error('Events list error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch events' });
    }
  }

  if (req.method === 'POST') {
    try {
      const parseResult = insertSchema.safeParse(req.body || {});
      if (!parseResult.success) {
        return res.status(400).json({ success: false, message: 'Invalid event data', errors: parseResult.error.flatten() });
      }
      const body = parseResult.data;

      const payload = {
        user_id: req.user.userId,
        title: body.title.trim(),
        description: body.description ?? null,
        start_time: new Date(body.startTime).toISOString(),
        end_time: new Date(body.endTime).toISOString(),
        timezone: body.timezone,
        location: body.location ?? null,
        is_all_day: Boolean(body.isAllDay),
        
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('events')
        .insert(payload)
        .select('id, user_id, title, description, start_time, end_time, timezone, location, is_all_day, created_at, updated_at')
        .single();
      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Event created', data });
    } catch (error) {
      console.error('Event create error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create event' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const id = (req.query?.id || '').toString();
      if (!id) return res.status(400).json({ success: false, message: 'Event id is required' });
      const parseResult = updateSchema.safeParse(req.body || {});
      if (!parseResult.success) {
        return res.status(400).json({ success: false, message: 'Invalid event data', errors: parseResult.error.flatten() });
      }
      const body = parseResult.data;
      const updateData = { updated_at: new Date().toISOString() };
      if (body.title !== undefined) updateData.title = String(body.title).trim();
      if (body.description !== undefined) updateData.description = body.description ?? null;
      if (body.startTime !== undefined) updateData.start_time = new Date(body.startTime).toISOString();
      if (body.endTime !== undefined) updateData.end_time = new Date(body.endTime).toISOString();
      if (body.timezone !== undefined) updateData.timezone = body.timezone;
      if (body.location !== undefined) updateData.location = body.location ?? null;
      if (body.isAllDay !== undefined) updateData.is_all_day = Boolean(body.isAllDay);
      

      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', req.user.userId)
        .select('id, user_id, title, description, start_time, end_time, timezone, location, is_all_day, created_at, updated_at')
        .single();
      if (error) throw error;
      if (!data) return res.status(404).json({ success: false, message: 'Event not found' });
      return res.status(200).json({ success: true, message: 'Event updated', data });
    } catch (error) {
      console.error('Event update error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update event' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = (req.query?.id || '').toString();
      if (!id) return res.status(400).json({ success: false, message: 'Event id is required' });
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user.userId);
      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Event deleted' });
    } catch (error) {
      console.error('Event delete error:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete event' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}


