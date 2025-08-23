import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

let webpush = null;
try {
  webpush = (await import('web-push')).default || (await import('web-push'));
} catch {
  webpush = null;
}

function isTargetMinute(nowUtc, tzOffsetMin, targetHourLocal) {
  // Convert UTC to local using stored offset
  const localMs = nowUtc.getTime() + tzOffsetMin * 60 * 1000;
  const local = new Date(localMs);
  return local.getHours() === targetHourLocal && local.getMinutes() === 0;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Optional protection
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

  if (!webpush) {
    return res.status(501).json({ success: false, message: 'web-push not available' });
  }

  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
  const publicKey = process.env.VAPID_PUBLIC_KEY || '';
  const privateKey = process.env.VAPID_PRIVATE_KEY || '';
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
  } catch {
    return res.status(500).json({ success: false, message: 'Invalid VAPID configuration' });
  }

  const nowUtc = new Date();
  try {
    // Fetch subscriptions with tz info
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('user_id, endpoint, p256dh, auth, tz_offset')
      .not('tz_offset', 'is', null);
    if (error) throw error;

    const payloadMorning = JSON.stringify({ title: 'Доброе утро!', body: 'Не забудь составить планы на день', url: '/' });
    const payloadNight = JSON.stringify({ title: 'Как прошёл твой день?', body: 'Не забудь занести информацию о сегодняшнем дне', url: '/wellbeing' });

    const sendOps = [];
    for (const s of subs || []) {
      const tzOffset = Number(s.tz_offset);
      if (!Number.isFinite(tzOffset)) continue;
      const isMorning = isTargetMinute(nowUtc, tzOffset, 9);
      const isNight = isTargetMinute(nowUtc, tzOffset, 21);
      if (!isMorning && !isNight) continue;
      const payload = isMorning ? payloadMorning : payloadNight;
      sendOps.push(webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload));
    }

    const results = await Promise.allSettled(sendOps);
    // Cleanup gone subscriptions (410/404)
    await Promise.all(results.map(async (r, idx) => {
      if (r.status === 'rejected') {
        const err = r.reason;
        const code = err?.statusCode || err?.code;
        if (code === 404 || code === 410) {
          const gone = (subs || [])[idx];
          if (gone?.endpoint) {
            await supabase.from('push_subscriptions').delete().eq('endpoint', gone.endpoint);
          }
        }
      }
    }));

    return res.status(200).json({ success: true, data: { targeted: sendOps.length } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Cron push failed', error: String(error?.message || error) });
  }
}


