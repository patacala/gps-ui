/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html, js, ts}',
  ],
  theme: {
    extend: {
      colors: {
        'gps-blue': '#4541FF',
        'gps-gray': '#a7a7a7',
        'gps-gray-black': '#9F9F9F',
        'gps-gray-black2': '#6A6A6A',
        'gps-gray-sweet': '#B0B0B0',
        'gps-gray': '#D8D8D8',
        'gps-purple': '#605CFF',
        'gps-purple-sweet': '#afadff',
        'gps-black': '#1E1E1E',
        'gps-red': '#CA0000',
        'gps-green': '#6FC600',
      },
      borderWidth: {
        '1': '1px'
      },
      backgroundImage: {
        'init-pattern': "url('../src/assets/Background-Texture 1.svg')",
      },
      width: {
        '3%': '3%',
        '10%': '10%',
        '97%': '97%',
      }
    },
  },
  plugins: [],
}
