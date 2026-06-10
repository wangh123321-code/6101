/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        board: {
          bg: '#0B1120',
          surface: '#111827',
          card: '#1A2332',
          border: '#2A3A4E',
          accent: '#00E5FF',
          critical: '#FF6B35',
          muted: '#6B7280',
          text: '#E5E7EB',
          dim: '#9CA3AF',
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body: ['Source Sans 3', 'sans-serif'],
      },
      screens: {
        sm: '1366px',
        lg: '1920px',
      },
      animation: {
        pulse_critical: 'pulse_critical 1.5s ease-in-out infinite',
        pulse_match: 'pulse_match 1s ease-in-out infinite',
      },
      keyframes: {
        pulse_critical: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 107, 53, 0.7)', borderColor: 'rgba(255, 107, 53, 0.5)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(255, 107, 53, 0.4)', borderColor: 'rgba(255, 107, 53, 1)' },
        },
        pulse_match: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 60, 60, 0.8)', backgroundColor: 'rgba(255, 60, 60, 0.05)' },
          '50%': { boxShadow: '0 0 24px 6px rgba(255, 60, 60, 0.5)', backgroundColor: 'rgba(255, 60, 60, 0.12)' },
        },
      },
    },
  },
  plugins: [],
};
