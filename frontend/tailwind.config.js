/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        halloween: {
          orange: '#FF6B35',
          purple: '#6A0572',
          black: '#1A1A1D',
          green: '#4E9F3D',
          darkPurple: '#3D0C4F',
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backgroundImage: {
        'gradient-halloween': 'linear-gradient(135deg, #6A0572 0%, #3D0C4F 100%)',
      },
    },
  },
  plugins: [],
};
