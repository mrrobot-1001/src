/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        handjet: ['Handjet', 'sans-serif'],
        maven: ['Maven Pro', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
        roboto: ['Roboto', 'sans-serif'],
        rubik: ['Rubik', 'sans-serif'],
        raleway: ['Raleway', 'sans-serif'],
        poppins:['Poppins','sans-serif'],
      },
      colors:{
        primary:'#00111C',
        secondary:'#001A2C',
        tertiary:'#002E4E',
      }
    },
  },
  plugins: [],
}

