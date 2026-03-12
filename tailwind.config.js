/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f04793',
          hover: '#e03d82',
          light: '#ff7bb6',
        },
        secondary: {
          DEFAULT: '#7c2859',
          light: '#9a3a70',
        },
        background: {
          soft: '#ffe8f1',
          softer: '#ffe8f2',
          light: '#ffd9ea',
          lighter: '#fff7fb',
        },
        border: {
          soft: '#ffd7e7',
          softer: '#ffd6e8',
        },
        gradient: {
          announcement: 'linear-gradient(90deg, #ff7bb6, #ff4f9c)',
          footer: 'linear-gradient(180deg, #ff9fc4 0%, #ffb3d4 100%)',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        pink: '0 10px 30px rgba(255, 105, 175, 0.12)',
        'pink-lg': '0 12px 24px rgba(240, 71, 147, 0.22)',
        'pink-sm': '0 8px 18px rgba(240, 71, 147, 0.16)',
      },
    },
  },
  plugins: [],
};
