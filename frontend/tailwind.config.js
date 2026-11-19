/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#0A0C16',         // Deep obsidian anime night
          card: '#121526',       // Frosted card surface
          elevated: '#1A1E36',   // Raised panel
          border: '#2A3056',     // Subtle cyber border
          hover: '#242A4A',      // Hover state
          purple: {
            light: '#C084FC',
            DEFAULT: '#8B5CF6',
            dark: '#6D28D9',
            glow: 'rgba(139, 92, 246, 0.4)'
          },
          cyan: {
            light: '#67E8F9',
            DEFAULT: '#06B6D4',
            dark: '#0E7490',
            glow: 'rgba(6, 182, 212, 0.4)'
          },
          pink: {
            DEFAULT: '#EC4899',
            dark: '#BE185D'
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Cabinet Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-pink': '0 0 25px -5px rgba(236, 72, 153, 0.35)',
      }
    },
  },
  plugins: [],
}

