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
          50:     '#fcf6f6',
          100:    '#faefef',
          200:    '#f5dede',
          400:    '#e5b8b8',
          500:    '#dca1a1',
          600:    '#c68d8d',
          700:    '#a87070',
          900:    '#633d3d',
          accent: '#b87777',
        }
      },
      boxShadow: {
        float: '0 20px 40px -15px rgba(0, 0, 0, 0.05)',
        'float-hover': '0 30px 50px -15px rgba(0, 0, 0, 0.08)',
        glass: 'inset 0 1px 0 0 rgba(255,255,255,0.6), 0 8px 30px rgba(0,0,0,0.04)',
        input: '0 2px 6px rgba(0,0,0,0.02), inset 0 0 0 1px rgba(0,0,0,0.04)',
        'input-focus': '0 4px 12px rgba(220,161,161,0.15), inset 0 0 0 1px rgba(220,161,161,0.6)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        blob: 'blob 10s infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '100%': { transform: 'translate(30px, -50px) scale(1.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
