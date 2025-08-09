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
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, description, due_date, completed, priority, created_at, updated_at')
        .eq('user_id', req.user.userId)
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
        user_id: req.user.userId,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(payload)
        .select('id, title, description, due_date, completed, priority, created_at, updated_at')
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, message: 'Task created', data });
    } catch (error) {
      console.error('Task create error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create task' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}


