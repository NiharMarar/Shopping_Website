/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyberpunk: {
          bg: '#181825', // deep blue-black
          surface: '#232136', // slightly lighter for cards
          neonBlue: '#00ffe7',
          neonPink: '#ff00cb',
          neonPurple: '#a259ff',
          neonYellow: '#ffe600',
          accent: '#00f0ff',
          accent2: '#ff6ec7',
        },
      },
      fontFamily: {
        nexus: [
          'Orbitron',
          'Montserrat',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        neon: '0 0 8px #00ffe7, 0 0 16px #ff00cb',
      },
    },
  },
  plugins: [],
};
