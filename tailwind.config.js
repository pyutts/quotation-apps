/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#e6f2f5',
          100: '#cce5eb',
          200: '#99ccd7',
          300: '#66b2c3',
          400: '#3399af',
          500: '#1a6e7f',
          600: '#165c6b',
          700: '#124a57',
        }
      }
    }
  },
  plugins: [],
}
