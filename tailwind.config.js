/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./Lendora.html",
    "./standalone/**/*.{js,jsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
        brand: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554', accent: '#f59e0b', alert: '#ef4444', success: '#10b981' }
      },
      fontFamily: { sans: ['Manrope', 'sans-serif'] },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'float': '0 12px 30px -10px rgba(30, 58, 138, 0.3)',
        'glow': '0 0 20px rgba(30, 58, 138, 0.4)',
        'accent': '0 8px 20px -6px rgba(245, 158, 11, 0.4)',
      }
    }
  },
  plugins: [],
}
