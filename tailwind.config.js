/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(10, 10, 10, 0.045), 0 1px 3px rgba(10, 10, 10, 0.03)',
        'soft-lg': '0 20px 50px rgba(10, 10, 10, 0.08), 0 4px 12px rgba(10, 10, 10, 0.04)',
      },
    },
  },
  plugins: [],
};
