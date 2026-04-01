Lendora Push Server (example)

This small express server shows how to accept push subscriptions and send cross-device notifications using web-push.

Setup:

1. Generate VAPID keys (you can use web-push npm):

```bash
npx web-push generate-vapid-keys --json
```

2. Set environment variables and install deps:

```bash
cd push-server
export VAPID_PUBLIC="<your_public_key>"
export VAPID_PRIVATE="<your_private_key>"
npm install
npm start
```

3. From the client (the Lendora app), the service worker will POST the subscription to `/subscribe`.

4. To trigger notifications from server:

```bash
curl -X POST http://localhost:3001/notify -H "Content-Type: application/json" -d '{"title":"Rental ending","body":"Your rental ends in 15 minutes","data":{"url":"/"}}'
```

Note: This is a demo only. For production use, persist subscriptions to a database, secure endpoints, and send notifications from server-side rental job scheduler or cron to ensure both parties receive reminders even when the browser is closed.
