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
          bg: '#000000',
          card: '#000000',
          elevated: '#000000',
          border: '#222222',
          hover: '#111111',
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
        'glow-purple': 'none',
        'glow-cyan': 'none',
        'glow-pink': 'none',
      }
    },
  },
  plugins: [],
}

