import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { authenticateToken } from '../server/lib/auth.js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://doirvgumddwncxujbosb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaXJ2Z3VtZGR3bmN4dWpib3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzYwMzcsImV4cCI6MjA2OTkxMjAzN30.q0vEL3ddgd4j9S639Jdbr6l1YU_ucaRxTJlMQrasX3s';
const supabase = createClient(supabaseUrl, supabaseKey);

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const daySchema = z.object({
  date: z.string().regex(dateRegex, 'YYYY-MM-DD').optional(),
  water: z.number().min(0).max(10).optional(), // liters
  sleep: z.number().min(0).max(24).optional(), // hours
  steps: z.number().int().min(0).max(100000).optional(),
  mood: z.number().int().min(0).max(4).optional(),
  journal: z.string().max(100000).optional().nullable(),
});

function todayDateStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

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

  // GET range or single day
  if (req.method === 'GET') {
    try {
      const from = (req.query?.from || '').toString();
      const to = (req.query?.to || '').toString();
      const date = (req.query?.date || '').toString();

      if (from && to) {
        const { data, error } = await supabase
          .from('reflect_days')
          .select('date, water, sleep, steps, mood, journal, created_at, updated_at')
          .eq('user_id', req.user.userId)
          .gte('date', from)
          .lte('date', to)
          .order('date', { ascending: true });
        if (error) throw error;
        return res.status(200).json({ success: true, data: data || [] });
      }

      const day = dateRegex.test(date) ? date : todayDateStr();
      const { data, error } = await supabase
        .from('reflect_days')
        .select('date, water, sleep, steps, mood, journal, created_at, updated_at')
        .eq('user_id', req.user.userId)
        .eq('date', day)
        .maybeSingle();
      if (error) throw error;
      return res.status(200).json({ success: true, data: data || null });
    } catch (error) {
      console.error('Reflect GET error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch reflect data' });
    }
  }

  // POST: upsert today (or provided date)
  if (req.method === 'POST') {
    try {
      const parse = daySchema.safeParse(req.body || {});
      if (!parse.success) return res.status(400).json({ success: false, message: 'Invalid data', errors: parse.error.flatten() });
      const { date, water, sleep, steps, mood, journal } = parse.data;
      const day = dateRegex.test(String(date || '')) ? String(date) : todayDateStr();

      // Check existing
      const { data: existing, error: findErr } = await supabase
        .from('reflect_days')
        .select('id')
        .eq('user_id', req.user.userId)
        .eq('date', day)
        .maybeSingle();
      if (findErr) throw findErr;

      const payload = {
        user_id: req.user.userId,
        date: day,
        updated_at: new Date().toISOString(),
      };
      if (water !== undefined) payload.water = water;
      if (sleep !== undefined) payload.sleep = sleep;
      if (steps !== undefined) payload.steps = steps;
      if (mood !== undefined) payload.mood = mood;
      if (journal !== undefined) payload.journal = journal ?? null;

      let result;
      if (existing?.id) {
        const { data, error } = await supabase
          .from('reflect_days')
          .update(payload)
          .eq('id', existing.id)
          .select('date, water, sleep, steps, mood, journal, created_at, updated_at')
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('reflect_days')
          .insert({ ...payload, created_at: new Date().toISOString() })
          .select('date, water, sleep, steps, mood, journal, created_at, updated_at')
          .single();
        if (error) throw error;
        result = data;
      }

      return res.status(200).json({ success: true, message: 'Saved', data: result });
    } catch (error) {
      console.error('Reflect POST error:', error);
      return res.status(500).json({ success: false, message: 'Failed to save reflect data' });
    }
  }

  // PATCH: partial update by date
  if (req.method === 'PATCH') {
    try {
      const parse = daySchema.safeParse(req.body || {});
      if (!parse.success) return res.status(400).json({ success: false, message: 'Invalid data', errors: parse.error.flatten() });
      const { date, water, sleep, steps, mood, journal } = parse.data;
      const day = dateRegex.test(String(date || '')) ? String(date) : todayDateStr();

      const updateData = { updated_at: new Date().toISOString() };
      if (water !== undefined) updateData.water = water;
      if (sleep !== undefined) updateData.sleep = sleep;
      if (steps !== undefined) updateData.steps = steps;
      if (mood !== undefined) updateData.mood = mood;
      if (journal !== undefined) updateData.journal = journal ?? null;

      const { data: row, error: findErr } = await supabase
        .from('reflect_days')
        .select('id')
        .eq('user_id', req.user.userId)
        .eq('date', day)
        .maybeSingle();
      if (findErr) throw findErr;

      if (!row?.id) return res.status(404).json({ success: false, message: 'Reflect day not found' });

      const { data, error } = await supabase
        .from('reflect_days')
        .update(updateData)
        .eq('id', row.id)
        .select('date, water, sleep, steps, mood, journal, created_at, updated_at')
        .single();
      if (error) throw error;

      return res.status(200).json({ success: true, message: 'Updated', data });
    } catch (error) {
      console.error('Reflect PATCH error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update reflect data' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}






