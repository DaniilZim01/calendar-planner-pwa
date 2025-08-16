import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { authenticateToken } from '../../server/lib/auth.js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://doirvgumddwncxujbosb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaXJ2Z3VtZGR3bmN4dWpib3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzYwMzcsImV4cCI6MjA2OTkxMjAzN30.q0vEL3ddgd4j9S639Jdbr6l1YU_ucaRxTJlMQrasX3s';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Auth
  try {
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (error) => (error ? reject(error) : resolve()));
    });
  } catch (error) {
    const status = error.status || 401;
    return res.status(status).json({ success: false, message: error.message || 'Unauthorized', error: error.error || 'unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const scope = (req.query?.scope || '').toString();

      // Fetch task ids belonging to the user via user_tasks mapping
      const { data: mappings, error: mapError } = await supabase
        .from('user_tasks')
        .select('task_id')
        .eq('user_id', req.user.userId);
      if (mapError) throw mapError;

      const taskIds = (mappings || []).map((m) => m.task_id);
      if (taskIds.length === 0) {
        return res.status(200).json({ success: true, message: 'Tasks fetched successfully', data: [] });
      }

      let query = supabase
        .from('tasks')
        .select('id, title, description, due_date, completed, priority, created_at, updated_at')
        .in('id', taskIds);

      // Hide completed tasks older than 7 days by due_date (client-friendly filtering)
      const hideOldCompleted = (req.query?.hideOldCompleted ?? '1') !== '0';
      if (hideOldCompleted) {
        const thresholdIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        // Include everything that is not completed OR has due_date >= threshold OR has no due_date
        // This effectively hides only completed tasks with due_date < threshold
        query = query.or(`completed.eq.false,due_date.gte.${thresholdIso},due_date.is.null`);
      }

      if (scope === 'today') {
        const today = new Date();
        const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0));
        const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59));
        query = query.gte('due_date', start.toISOString()).lte('due_date', end.toISOString());
      } else if (scope === 'week') {
        const now = new Date();
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const day = d.getUTCDay();
        const diff = (day === 0 ? -6 : 1) - day; // Monday start
        d.setUTCDate(d.getUTCDate() + diff);
        d.setUTCHours(0, 0, 0, 0);
        const start = d;
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 6);
        end.setUTCHours(23, 59, 59, 999);
        query = query.gte('due_date', start.toISOString()).lte('due_date', end.toISOString());
      }

      const { data, error } = await query
        .order('due_date', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Tasks fetched successfully',
        data: data || [],
      });
    } catch (error) {
      console.error('Tasks list error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
    }
  }

  if (req.method === 'POST') {
    try {
      const createTaskSchema = z.object({
        title: z.string().min(1, 'Title is required').max(255),
        description: z.string().max(10000).optional().nullable(),
        dueDate: z.union([z.string().datetime({ offset: true }).or(z.string()), z.null()]).optional(),
        priority: z.number().int().min(1).max(5).optional(),
      });

      const parseResult = createTaskSchema.safeParse(req.body || {});
      if (!parseResult.success) {
        return res.status(400).json({ success: false, message: 'Invalid task data', errors: parseResult.error.flatten() });
      }

      const { title, description, dueDate, priority } = parseResult.data;

      const payload = {
        title: title.trim(),
        description: description ? String(description) : null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        priority: Number.isInteger(priority) ? priority : 1,
        completed: false,
        updated_at: new Date().toISOString(),
      };

      const { data: created, error: insertError } = await supabase
        .from('tasks')
        .insert(payload)
        .select('id, title, description, due_date, completed, priority, created_at, updated_at')
        .single();
      if (insertError) throw insertError;

      // link to user via user_tasks
      const { error: linkError } = await supabase
        .from('user_tasks')
        .insert({ user_id: req.user.userId, task_id: created.id });
      if (linkError) throw linkError;

      return res.status(201).json({ success: true, message: 'Task created', data: created });
    } catch (error) {
      console.error('Task create error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create task' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}


