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
        brand: {
          dark: '#0B0F19',
          card: '#151D30',
          border: '#1F2E4D',
          glow: '#00D8F6',
          danger: '#FF4A4A',
          warning: '#FFAA00',
          success: '#00E676',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 15px rgba(0, 216, 246, 0.2)',
        'glow-lg': '0 0 25px rgba(0, 216, 246, 0.4)',
        'glow-red': '0 0 15px rgba(255, 74, 74, 0.3)',
        'glow-green': '0 0 15px rgba(0, 230, 118, 0.3)',
      }
    },
  },
  plugins: [],
}
