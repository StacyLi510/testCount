/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['PingFang SC', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          400: '#22D3EE',
          500: '#0EA5E9',
          600: '#0891B2',
          700: '#0E7490',
        },
      },
      boxShadow: {
        card: '0 4px 24px -8px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
