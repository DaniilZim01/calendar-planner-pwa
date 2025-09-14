import { createClient } from '@supabase/supabase-js';

let webpush = null;
try {
  // @ts-ignore
  webpush = (await import('web-push')).default || (await import('web-push'));
} catch (_) {
  webpush = null;
}

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
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();

    let cleanupDeleted = 0;
    let notificationsSent = 0;

    // 1) Run cleanup once per day around 03:00 UTC
    if (utcHour === 3 && utcMinute === 0) {
      const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: oldCompleted, error: findError } = await supabase
        .from('tasks')
        .select('id')
        .eq('completed', true)
        .lte('updated_at', sevenDaysAgoIso);
      if (findError) throw findError;

      const taskIds = (oldCompleted || []).map((t) => t.id);
      if (taskIds.length > 0) {
        const { error: mappingDeleteError } = await supabase
          .from('user_tasks')
          .delete()
          .in('task_id', taskIds);
        if (mappingDeleteError) throw mappingDeleteError;

        const { error: tasksDeleteError } = await supabase
          .from('tasks')
          .delete()
          .in('id', taskIds);
        if (tasksDeleteError) throw tasksDeleteError;

        cleanupDeleted = taskIds.length;
      }
    }

    // 2) Morning notifications at users' local 09:00 (checked every minute)
    if (webpush) {
      try {
        const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
        const publicKey = process.env.VAPID_PUBLIC_KEY || '';
        const privateKey = process.env.VAPID_PRIVATE_KEY || '';
        webpush.setVapidDetails(subject, publicKey, privateKey);

        const { data: subs, error } = await supabase
          .from('push_subscriptions')
          .select('endpoint, p256dh, auth, tz_offset');
        if (error) throw error;

        const notifications = [];
        for (const s of subs || []) {
          const offset = Number.isFinite(Number(s.tz_offset)) ? Number(s.tz_offset) : -now.getTimezoneOffset();
          const minutesUtc = now.getUTCHours() * 60 + now.getUTCMinutes();
          const localMinutes = (minutesUtc + offset) % (24 * 60);
          const localHour = Math.floor(((localMinutes + 24 * 60) % (24 * 60)) / 60);
          const localMinute = ((localMinutes % 60) + 60) % 60;
          if (localHour === 9 && localMinute === 0) {
            const payload = JSON.stringify({ title: 'Доброе утро!', body: 'Не забудь составить планы на день', url: '/' });
            notifications.push(
              webpush.sendNotification(
                { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
                payload,
              )
            );
          }
        }

        const results = await Promise.allSettled(notifications);
        notificationsSent = results.filter((r) => r.status === 'fulfilled').length;

        await Promise.all(results.map(async (r, idx) => {
          if (r.status === 'rejected') {
            const err = r.reason;
            const code = err?.statusCode || err?.code;
            if (code === 404 || code === 410) {
              const sub = (subs || [])[idx];
              if (sub) await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
            }
          }
        }));
      } catch (e) {
        console.warn('Morning notifications skipped:', e?.message || e);
      }
    }

    return res.status(200).json({ success: true, data: { cleanupDeleted, notificationsSent } });
  } catch (error) {
    console.error('Cron combined error:', error);
    return res.status(500).json({ success: false, message: 'Cron failed', error: String(error?.message || error) });
  }
}


