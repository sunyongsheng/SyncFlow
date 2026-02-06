/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0891B2', // Cyan-600
          hover: '#06B6D4',   // Cyan-500
          active: '#0E7490',  // Cyan-700
          bg: '#ECFEFF',      // Cyan-50
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Work Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
