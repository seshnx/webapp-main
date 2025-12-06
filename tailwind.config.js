/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode based on the 'dark' class on the HTML tag
  theme: {
    extend: {
      colors: {
        'brand-blue': '#3D84ED',
        'brand-dark-accent': '#3C5DE8',
        'bg-soft': '#f7fbff',
        'dark-bg-primary': '#1f2128',
        'dark-card': '#2c2e36',
        'social-pink': '#f91880',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
