const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');

// Replace these with your VAPID keys (generate with web-push CLI)
const VAPID_PUBLIC = process.env.VAPID_PUBLIC || 'REPLACE_WITH_YOUR_VAPID_PUBLIC_KEY';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE || 'REPLACE_WITH_YOUR_VAPID_PRIVATE_KEY';

webpush.setVapidDetails('mailto:admin@lendora.local', VAPID_PUBLIC, VAPID_PRIVATE);

const app = express();
app.use(bodyParser.json());

// Simple in-memory subscription store for demo purposes
const SUBSCRIPTIONS = [];

app.post('/subscribe', (req, res) => {
  try {
    const sub = req.body;
    if (!sub || !sub.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
    if (!SUBSCRIPTIONS.find(s => s.endpoint === sub.endpoint)) SUBSCRIPTIONS.push(sub);
    return res.json({ ok: true });
  } catch (e) { return res.status(500).json({ error: e.message }); }
});

app.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body || {};
  if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });
  for (let i = SUBSCRIPTIONS.length - 1; i >= 0; i--) if (SUBSCRIPTIONS[i].endpoint === endpoint) SUBSCRIPTIONS.splice(i, 1);
  return res.json({ ok: true });
});

app.post('/notify', async (req, res) => {
  const payload = req.body || { title: 'Lendora', body: 'Test notification' };
  const results = [];
  await Promise.all(SUBSCRIPTIONS.map(async (sub) => {
    try {
      await webpush.sendNotification(sub, JSON.stringify(payload));
      results.push({ endpoint: sub.endpoint, status: 'sent' });
    } catch (err) {
      results.push({ endpoint: sub.endpoint, status: 'error', error: err.message });
    }
  }));
  res.json({ results });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Push server listening on http://localhost:${PORT}`));
