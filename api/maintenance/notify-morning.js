import { createClient } from '@supabase/supabase-js';

let webpush = null;
try {
  // @ts-ignore
  webpush = (await import('web-push')).default || (await import('web-push'));
} catch (_) {
  webpush = null;
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Allow manual trigger with ?force=1 to test
  const force = String(req.query?.force || '0') === '1';

  if (!webpush) {
    return res.status(501).json({ success: false, message: 'web-push is not available on this deployment' });
  }

  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
  const publicKey = process.env.VAPID_PUBLIC_KEY || '';
  const privateKey = process.env.VAPID_PRIVATE_KEY || '';
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
  } catch {
    return res.status(500).json({ success: false, message: 'Invalid VAPID configuration' });
  }

  try {
    // Load all subscriptions with timezone/offset
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth, timezone, tz_offset');
    if (error) throw error;

    const now = new Date();
    const notifications = [];
    for (const s of subs || []) {
      // Compute local time using tz_offset (minutes) if present; fallback to environment time
      let localMinutes = now.getUTCFullYear() * 525600 + now.getUTCMonth() * 43200 + now.getUTCDate() * 1440 + now.getUTCHours() * 60 + now.getUTCMinutes();
      const offset = Number.isFinite(Number(s.tz_offset)) ? Number(s.tz_offset) : -now.getTimezoneOffset();
      localMinutes += offset;
      const localHour = Math.floor((localMinutes % (24 * 60)) / 60);
      const localMinute = localMinutes % 60;

      if (force || (localHour === 9 && localMinute === 0)) {
        const payload = JSON.stringify({
          title: 'Доброе утро!',
          body: 'Не забудь составить планы на день',
          url: '/',
        });
        notifications.push(webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload));
      }
    }

    const results = await Promise.allSettled(notifications);
    // Cleanup gone subscriptions
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

    return res.status(200).json({ success: true, data: { sent: notifications.length } });
  } catch (e) {
    console.error('notify-morning error', e);
    return res.status(500).json({ success: false, message: 'Failed to send morning notifications' });
  }
}


