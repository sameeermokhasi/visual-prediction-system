/* In frontend/tailwind.config.js */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      aspectRatio: {
        'video': '16 / 9',
        '4/3': '4 / 3',
        'square': '1 / 1',
      },
    },
  },
  plugins: [
     require('@tailwindcss/aspect-ratio'),
  ],
}