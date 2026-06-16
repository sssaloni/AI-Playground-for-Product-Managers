/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#09090b', // Zinc 950
        darkSurface: '#121214', // Custom dark gray
        darkBorder: '#27272a', // Zinc 800
        brandPurple: '#8b5cf6', // Violet 500
        brandCyan: '#06b6d4', // Cyan 500
        brandAmber: '#f59e0b', // Amber 500
        brandGreen: '#10b981', // Emerald 500
      },
    },
  },
  plugins: [],
}
