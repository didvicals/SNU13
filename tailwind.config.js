/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#fdfbf9',
          100: '#fbf7f3', // Main background
          200: '#f3ece4',
          300: '#e8ded0',
          400: '#d7c4af',
          500: '#bfa084', // Primary Border ?
          800: '#5c4d40',
          900: '#3e342b', // Main Text
        },
        accent: {
          primary: '#da6e55', // Terracotta
          secondary: '#d9a76d', // Gold/Ochre
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(62, 52, 43, 0.05)',
        'card': '0 2px 8px -1px rgba(62, 52, 43, 0.05), 0 0 1px rgba(62, 52, 43, 0.1)',
      }
    },
  },
  plugins: [],
}
