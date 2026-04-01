# 📱 Lendora - Get Your App Running on Your Phone

## Quick Start (60 seconds)

### On Mac:
```bash
cd /Users/powerhousestudios/Desktop/LENDORA
./run.sh
```

### On Windows:
```bash
cd C:\Users\[YourUsername]\Desktop\LENDORA
run.bat
```

Then on your phone, visit: **http://YOUR_COMPUTER_IP:3000**

---

## What You Need

✓ **Node.js 18+** - [Download](https://nodejs.org/)  
✓ **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/)  
✓ Same WiFi network for phone & computer

---

## Getting Your Computer's IP Address

### Mac:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```
Look for: `192.168.x.x` or `10.0.x.x`

### Windows:
In Command Prompt:
```
ipconfig
```
Look for: "IPv4 Address"

---

## On Your Phone

1. **Make sure WiFi is ON** and connected to the same network as your computer
2. **Open browser** and visit: `http://192.168.1.100:3000` (use your actual IP)
3. **See the app!** 🎉
4. **(Optional)** On home screen → Share → Add to Home Screen (make it an app)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Can't connect to http://IP:3000" | Check both devices on same WiFi |
| "Port 3000 already in use" | Kill old process: `lsof -i :3000` then `kill -9 PID` |
| "Database connection error" | Make sure PostgreSQL is running |
| "Backend won't start" | Check PostgreSQL credentials in `backend/.env` |

---

## What's Included

📁 **backend/** - Node.js/Express API server  
📁 **frontend/** - React web app  
🗄️ **PostgreSQL** - Database  
📱 **PWA** - Works like a native app (add to home screen)  

---

## What the App Does

✓ Browse & list items for rent  
✓ View campus map locations  
✓ Send/receive messages  
✓ Track rental activity  
✓ Leave reviews  
✓ Works offline (cached data)  

---

## API Endpoints (For Reference)

```
POST   /api/auth/register           # Create account
POST   /api/auth/login              # Login
GET    /api/items                   # List all items
GET    /api/items/:id               # Item details
POST   /api/rentals                 # Create rental
GET    /api/messages/:userId        # Get messages
```

---

## File Structure

```
LENDORA/
├── backend/
│   ├── src/
│   │   ├── server.js       ← Edit API routes here
│   │   └── db/init.js      ← Database config
│   ├── package.json
│   └── .env
├── frontend/
│   ├── index.html          ← Main page
│   ├── api.js              ← API client
│   └── package.json
├── run.sh                  ← Start everything (Mac/Linux)
├── run.bat                 ← Start everything (Windows)
└── PHONE_SETUP.md          ← Detailed guide
```

---

## Common Tasks

### Add New Feature
1. Design API endpoint in `backend/src/server.js`
2. Add database table if needed in `backend/src/db/init.js`
3. Call API from frontend form or button

### Deploy to Production
1. Use Docker: `docker-compose up`
2. Or host on Heroku/Railway/Vercel
3. Update API URL in `frontend/vite.config.js`

### Change Database
1. Update `backend/.env` with new credentials
2. Re-run `npm run db:init` to create tables

---

## Questions?

Check the **detailed guide**: `PHONE_SETUP.md`

Good luck! 🚀
