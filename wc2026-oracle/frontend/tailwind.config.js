/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#000000',
        'bg-secondary': '#0A0A0A',
        'gold': '#FFFFFF', // Keeping the key as gold to prevent tailwind class breaks, but it's now pure white
        'red': '#C41E3A',
        'text-primary': '#F0F0F0',
        'text-muted': '#A3A3A3', // Switched to a cleaner neutral gray
      },
      fontFamily: {
        'display': ['Outfit', 'sans-serif'],
        'body': ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow-white': '0 0 30px rgba(255, 255, 255, 0.15)',
        'glow-white-strong': '0 0 40px rgba(255, 255, 255, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 255, 255, 0.3)' },
        }
      }
    },
  },
  plugins: [],
}
