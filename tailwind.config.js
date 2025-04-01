/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       // Add custom theme extensions if desired (e.g., specific colors)
       colors: {
         primary: { // Example primary color
           light: '#6ee7b7', // emerald-300
           DEFAULT: '#10b981', // emerald-500
           dark: '#047857', // emerald-700
         },
         secondary: '#3b82f6', // blue-500
       }
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Optional: nicer default form styles
  ],
}