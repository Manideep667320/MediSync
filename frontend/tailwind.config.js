/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#172A3A', // Dark navy
          800: '#004346', // Dark forest green
          700: '#508991', // Mid teal
          500: '#74B3CE', // Light blue/teal
          300: '#D6F3F4', // Light cyan
          100: '#F0FDFD', // Cyan/white
        },
        primary: {
          main: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
        },
        secondary: {
          main: '#8b5cf6',
          light: '#a78bfa',
          dark: '#7c3aed',
        },
        accent: {
          pink: '#ec4899',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      backdropBlur: {
        '2xl': '40px',
        '3xl': '60px',
      },
      boxShadow: {
        'glow-blue': '0 0 40px rgba(59, 130, 246, 0.3)',
        'glow-purple': '0 0 40px rgba(139, 92, 246, 0.3)',
        'glow-pink': '0 0 40px rgba(236, 72, 153, 0.3)',
        'glow-green': '0 0 40px rgba(16, 185, 129, 0.3)',
        'glow-orange': '0 0 40px rgba(249, 115, 22, 0.3)',
      },
    },
  },
  plugins: [],
}