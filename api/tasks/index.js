import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from '../auth/middleware.js';

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
      const { title, description, dueDate, priority } = req.body || {};
      if (!title || typeof title !== 'string' || title.trim().length < 1) {
        return res.status(400).json({ success: false, message: 'Title is required' });
      }

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


