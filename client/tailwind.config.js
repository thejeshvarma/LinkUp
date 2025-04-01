/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'whatsapp-green': '#25D366',
        'whatsapp-light': '#ECE5DD',
        'whatsapp-dark': '#333333',
      },
    },
  },
  plugins: [],
} 