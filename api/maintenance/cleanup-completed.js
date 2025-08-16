import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://doirvgumddwncxujbosb.supabase.co';
// Prefer service role for server-side maintenance to bypass RLS where applicable
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaXJ2Z3VtZGR3bmN4dWpib3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzYwMzcsImV4cCI6MjA2OTkxMjAzN30.q0vEL3ddgd4j9S639Jdbr6l1YU_ucaRxTJlMQrasX3s';
const supabase = createClient(supabaseUrl, supabaseKey);

// Scheduled cleanup: removes completed tasks older than 7 days
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Simple protection: accept either header or query param when CRON_SECRET is set
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const providedHeader = req.headers['x-cron-secret'];
    const providedQuery = req.query?.secret || req.query?.cron_secret;
    const vercelCronHeader = req.headers['x-vercel-cron'];
    const isVercelCron = typeof vercelCronHeader !== 'undefined';
    if (providedHeader !== cronSecret && providedQuery !== cronSecret && !isVercelCron) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
  }

  try {
    const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // 1) Find tasks to delete
    const { data: oldCompleted, error: findError } = await supabase
      .from('tasks')
      .select('id')
      .eq('completed', true)
      .lte('updated_at', sevenDaysAgoIso);
    if (findError) throw findError;

    const taskIds = (oldCompleted || []).map((t) => t.id);
    if (taskIds.length === 0) {
      return res.status(200).json({ success: true, message: 'No tasks to cleanup', data: { deleted: 0 } });
    }

    // 2) Remove mappings first to avoid FK constraints
    const { error: mappingDeleteError } = await supabase
      .from('user_tasks')
      .delete()
      .in('task_id', taskIds);
    if (mappingDeleteError) throw mappingDeleteError;

    // 3) Delete tasks
    const { error: tasksDeleteError } = await supabase
      .from('tasks')
      .delete()
      .in('id', taskIds);
    if (tasksDeleteError) throw tasksDeleteError;

    return res.status(200).json({ success: true, message: 'Cleanup done', data: { deleted: taskIds.length } });
  } catch (error) {
    console.error('Cron cleanup error:', error);
    return res.status(500).json({ success: false, message: 'Cleanup failed', error: String(error?.message || error) });
  }
}


