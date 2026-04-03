/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 12px 32px rgba(15, 23, 42, 0.12)',
      },
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          500: '#2f7fff',
          600: '#1f66e5',
          700: '#194fb3',
        },
      },
    },
  },
  plugins: [],
};
