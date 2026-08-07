/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        ink: '#191c1e',
        muted: '#5c6370',
        brand: {
          blue: '#2563eb',
          deepBlue: '#004ac6',
          teal: '#006b5f',
          mint: '#6df5e1',
        }
      }
    },
  },
  plugins: [],
}
