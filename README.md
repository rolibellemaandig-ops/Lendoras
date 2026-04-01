# Lendora | Buy less. Do more

A modern React application for USTP CDO students to rent and lend campus equipment, cameras, tech, and academic tools.

## 🚀 Quick Start (Option 1: Use HTML Now)

The app is fully functional as a single HTML file! Simply:

```bash
open Lendora.html
```

This works immediately in any browser with no setup required. All 20+ features are included:
- ✅ 20 Campus Items with full details
- ✅ Interactive campus mapping
- ✅ Multi-step checkout with payment methods
- ✅ Real-time messaging & notifications
- ✅ Wishlist & comparison tools
- ✅ Admin & customer support center
- ✅ Handoff QR & verification
- ✅ Wallet & ledger management

## ⚡ Modern Setup (Option 2: Vite + React Development)

For professional development with hot reload, TypeScript support, and optimized builds:

### Prerequisites
- [Node.js 16+](https://nodejs.org/) - Download and install

### Installation

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
LENDORA/
├── Lendora.html           # Standalone single-file version (use this now!)
├── package.json           # NPM dependencies for Vite setup
├── vite.config.js         # Vite bundler config
├── tailwind.config.js     # Tailwind CSS config
├── postcss.config.js      # PostCSS plugins
├── index.html             # React entry point
├── src/
│   ├── main.jsx          # React app initialization
│   ├── App.jsx           # Launcher for the standalone app
│   ├── index.css         # Global styles & Tailwind
│   └── components/       # Reusable React components
└── dist/                 # Production build output
```

## 🎨 Features

### Campus Inventory (20 Items)
- Sony A7 IV, DJI Mavic 3, MacBook Pro, Arduino Kits, 3D Printers
- Lighting Rigs, Audio Equipment, Lab Equipment, and more
- Real-time item availability, reviews, and insurance status

### Smart Matching
- Filter by category (Production, Academic, Tech)
- Sort by price, rating, or availability
- Interactive campus map with turn-by-turn directions

### Secure Rentals
- Multi-step checkout with deposit calculations
- Escrow payment protection
- Multiple payment methods (Wallet, GCash, Card, Cash)

### Real-Time Communication
- Direct messaging between lenders and borrowers
- Notification system with 7+ alert types
- Live chat support center with FAQ database

### Smart Handoff
- QR-based item verification
- Camera-based condition checks
- Digital receipt generation

### User Features
- Verified identity profiles with ratings
- Wishlist with comparison tool
- Activity & rental tracking
- Wallet with top-up & withdrawal
- Claims & dispute resolution

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **UI Library** | React 18 with Hooks |
| **Bundler** | Vite 4+ |
| **Styling** | Tailwind CSS 3 + PostCSS |
| **Animations** | Framer Motion 10 |
| **Icons** | Phosphor Icons |
| **Mapping** | Leaflet.js 1.9 |
| **Build Target** | Both HTML & Modern React App |

## 🎯 What's Working Now

✅ Full app in `Lendora.html` - Open it in any browser  
✅ Error boundaries & fallbacks for any library failures  
✅ Toast notifications system  
✅ Form validation utilities  
✅ 20 campus items with real details  
✅ Complete UI component library  
✅ Interactive campus map (Leaflet)  
✅ All views & navigation  

## 📝 Next Steps

1. **Use Now**: Open `Lendora.html` in your browser
2. **Explore Features**: Navigate through all 20+ views
3. **Setup Modern Dev** (Optional):
   ```bash
   node --version  # Verify Node.js installed
   npm install
   npm run dev
   ```

## 🔧 Configuration

### Tailwind Colors
- **Brand**: #3b82f6 (Primary blue)
- **Accent**: #f59e0b (Warning yellow)  
- **Alert**: #ef4444 (Error red)
- **Success**: #10b981 (Green)

### Campus Coordinates
- Center: [8.4855, 124.6565]
- Zoom: Level 17 (street view)
- All items mapped to real USTP buildings

## 📱 Responsive Design

- **Full Screen**: Optimized for desktop browsers
- **Phone Frame**: 414px × 850px (iPhone mockup)
- **Mobile**: Works on actual mobile devices
- **Touch**: Full touch event handling

## 🚨 Troubleshooting

**Blank Page?**
- Check browser console (F12)
- Verify JavaScript is enabled
- Try harder refresh (Cmd+Shift+R or Ctrl+Shift+F5)

**Components Not Showing?**
- Framer Motion fallback included - works without CDN
- All animations degrade gracefully
- Fonts load from Google Fonts CDN

**Leaflet Map Not Loading?**
- Leaflet CSS & JS from CDN in index.html
- Verify internet connection
- Check for browser console errors

## 📄 License

Built for USTP CDO students. Built around the idea: Buy less. Do more.

---

**Current Status**: Production-ready single HTML file with enterprise-grade error handling ✨

Questions? Check the browser console for detailed logging and error messages.
