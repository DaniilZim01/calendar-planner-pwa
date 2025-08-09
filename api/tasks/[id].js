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

  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, message: 'Task id is required' });

  if (req.method === 'PUT') {
    try {
      const { title, description, dueDate, priority, completed } = req.body || {};
      const updateData = { updated_at: new Date().toISOString() };
      if (title !== undefined) updateData.title = String(title).trim();
      if (description !== undefined) updateData.description = description ? String(description) : null;
      if (dueDate !== undefined) updateData.due_date = dueDate ? new Date(dueDate).toISOString() : null;
      if (priority !== undefined) updateData.priority = Number(priority);
      if (completed !== undefined) updateData.completed = Boolean(completed);

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', req.user.userId)
        .select('id, title, description, due_date, completed, priority, created_at, updated_at')
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ success: false, message: 'Task not found' });

      return res.status(200).json({ success: true, message: 'Task updated', data });
    } catch (error) {
      console.error('Task update error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update task' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user.userId);

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Task deleted' });
    } catch (error) {
      console.error('Task delete error:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete task' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      // toggle completed
      const { data: existing, error: findError } = await supabase
        .from('tasks')
        .select('completed')
        .eq('id', id)
        .eq('user_id', req.user.userId)
        .single();
      if (findError) throw findError;
      if (!existing) return res.status(404).json({ success: false, message: 'Task not found' });

      const { data, error } = await supabase
        .from('tasks')
        .update({ completed: !existing.completed, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', req.user.userId)
        .select('id, title, description, due_date, completed, priority, created_at, updated_at')
        .single();
      if (error) throw error;

      return res.status(200).json({ success: true, message: 'Task toggled', data });
    } catch (error) {
      console.error('Task toggle error:', error);
      return res.status(500).json({ success: false, message: 'Failed to toggle task' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}


