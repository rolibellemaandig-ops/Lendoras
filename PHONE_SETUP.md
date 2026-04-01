# 🚀 Lendora Mobile App - Setup Guide

Your Lendora app is now a full-stack application with backend API, database, and mobile-ready frontend. Here's how to get it running on your phone.

## Prerequisites

### Option 1: Using Docker (Easiest)
- Docker Desktop installed ([download](https://www.docker.com/products/docker-desktop))
- 4GB+ free disk space

### Option 2: Without Docker
- Node.js 18+ ([download](https://nodejs.org/))
- PostgreSQL 12+ ([download](https://www.postgresql.org/download/))

---

## Quick Start (With Docker)

```bash
cd /Users/powerhousestudios/Desktop/LENDORA
docker-compose up
```

Then access the app at: **http://localhost:3000**

---

## Manual Setup (Without Docker)

### Step 1: Install PostgreSQL
1. Download and install PostgreSQL from [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
2. Start the PostgreSQL server
3. Create a database:
   ```bash
   createdb lendora
   ```

### Step 2: Set Up Backend
```bash
cd backend
npm install
npm run db:init
```

This will:
- Install all dependencies
- Create database tables
- Insert sample data

### Step 3: Start Backend
```bash
cd backend
npm run dev
```

You should see:
```
✓ Database connected
🚀 Lendora API running on http://localhost:5000
```

### Step 4: Set Up Frontend (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

You should see something like:
```
  VITE v4.4.0  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://YOUR_IP:3000/
```

---

## Accessing App on Your Phone

### 1. Find Your Computer's IP Address

**On Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Look for something like: `192.168.x.x` or `10.0.x.x`

**On Windows (PowerShell):**
```
ipconfig
```

Look for "IPv4 Address"

### 2. Connect Your Phone (Same WiFi Network)

Open your phone's browser and go to:
```
http://YOUR_COMPUTER_IP:3000
```

Example: `http://192.168.1.100:3000`

### 3. (Optional) Add to Home Screen
- **iPhone**: Tap Share → Add to Home Screen
- **Android**: Tap Menu (⋮) → Install App

The app will then work offline and like a native app!

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with email/password

### Items (Listings)
- `GET /api/items` - Get all available items
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get item details

### Rentals
- `POST /api/rentals` - Create rental request
- `GET /api/rentals/user/:userId` - Get user's rentals

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:userId` - Get user's messages

---

## Database Schema

The app automatically creates these tables:

- **users** - User accounts and profiles
- **items** - Rental listings
- **rentals** - Rental transactions
- **messages** - User messages
- **reviews** - Rental reviews
- **saved_items** - Bookmarked listings

Sample data is automatically inserted with 3 users and 4 items.

---

## Troubleshooting

### Backend won't start
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
→ Make sure PostgreSQL is running

### Phone can't connect
```
Error: Failed to fetch from http://YOUR_IP:3000
```
→ Make sure both devices are on the same WiFi network

### Port already in use
```
Error: EADDRINUSE: address already in use :::3000
```
→ Change port in `frontend/vite.config.js`

---

## Environment Variables

`.env` files are already configured:

**Backend** (`backend/.env`):
```
PORT=5000
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lendora
```

**Frontend** uses auto-detection of your computer IP.

---

## File Structure

```
LENDORA/
├── backend/
│   ├── src/
│   │   ├── server.js          # Main API server
│   │   └── db/init.js         # Database setup
│   ├── package.json
│   └── .env
├── frontend/
│   ├── api.js                 # API client
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── docker-compose.yml         # Docker setup
└── start.sh                   # Startup script
```

---

## Next Steps

1. ✅ Get the app running locally
2. ✅ Access it on your phone
3. Go to `backend/src/server.js` to add more features
4. Go to `frontend/` to customize the React components
5. Update `frontend/api.js` to add new API calls

---

## Default Login Credentials

The app comes with sample users:

| Email | Password |
|-------|----------|
| john@example.com | - |
| jane@example.com | - |
| alex@example.com | - |

(Note: Implement proper authentication in `backend/src/server.js`)

---

## Support

For issues with:
- **Database**: Check PostgreSQL is running
- **API**: Check `backend/src/server.js` logs
- **Frontend**: Check browser console (F12)
- **Network**: Ensure phone and computer on same WiFi

Good luck! 🚀
