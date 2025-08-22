import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from '../server/lib/auth.js';

// Reuse Supabase client as in other endpoints
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Optional web-push; function degrades gracefully if not installed
let webpush = null;
try {
  // @ts-ignore
  webpush = (await import('web-push')).default || (await import('web-push'));
} catch (_) {
  webpush = null;
}

export default async function handler(req, res) {
  // Public key fetch: GET /api/push?vapid=1
  if (req.method === 'GET') {
    if (String(req.query?.vapid) === '1') {
      return res.status(200).json({ success: true, data: { publicKey: process.env.VAPID_PUBLIC_KEY || '' } });
    }
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Auth for state-changing ops
  try {
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (error) => (error ? reject(error) : resolve()));
    });
  } catch (error) {
    const status = error.status || 401;
    return res.status(status).json({ success: false, message: error.message || 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const action = (req.body?.action || '').toString();

  if (action === 'subscribe') {
    const sub = req.body?.subscription || req.body;
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return res.status(400).json({ success: false, message: 'Invalid subscription' });
    }
    const now = new Date().toISOString();
    // upsert by endpoint
    const { data: existing } = await supabase.from('push_subscriptions')
      .select('id')
      .eq('endpoint', sub.endpoint)
      .maybeSingle();
    let result;
    if (existing?.id) {
      const { data, error } = await supabase.from('push_subscriptions')
        .update({ user_id: req.user.userId, p256dh: sub.keys.p256dh, auth: sub.keys.auth, updated_at: now })
        .eq('id', existing.id)
        .select('id')
        .single();
      if (error) return res.status(500).json({ success: false, message: 'Failed to update subscription' });
      result = data;
    } else {
      const { data, error } = await supabase.from('push_subscriptions')
        .insert({ user_id: req.user.userId, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, created_at: now, updated_at: now })
        .select('id')
        .single();
      if (error) return res.status(500).json({ success: false, message: 'Failed to save subscription' });
      result = data;
    }
    return res.status(200).json({ success: true, data: { ok: true, id: result?.id } });
  }

  if (action === 'unsubscribe') {
    const endpoint = (req.body?.endpoint || '').toString();
    if (!endpoint) return res.status(400).json({ success: false, message: 'Missing endpoint' });
    const { error } = await supabase.from('push_subscriptions')
      .delete()
      .eq('user_id', req.user.userId)
      .eq('endpoint', endpoint);
    if (error) return res.status(500).json({ success: false, message: 'Failed to remove subscription' });
    return res.status(200).json({ success: true, data: { ok: true } });
  }

  if (action === 'send') {
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
    const title = (req.body?.title || 'Напоминание').toString();
    const body = (req.body?.body || '').toString();
    const url = (req.body?.url || '/').toString();
    const payload = JSON.stringify({ title, body, url });
    const { data: subs, error } = await supabase.from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', req.user.userId);
    if (error) return res.status(500).json({ success: false, message: 'Failed to load subscriptions' });
    const results = await Promise.allSettled((subs || []).map((s) => {
      return webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
    }));
    // Cleanup gone subscriptions (410/404)
    await Promise.all(results.map(async (r, idx) => {
      if (r.status === 'rejected') {
        const err = r.reason;
        const code = err?.statusCode || err?.code;
        if (code === 404 || code === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', subs[idx].endpoint);
        }
      }
    }));
    return res.status(200).json({ success: true, data: { ok: true } });
  }

  return res.status(400).json({ success: false, message: 'Unknown action' });
}


