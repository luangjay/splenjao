/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    fontFamily: {
      number: ['"Source Sans Pro"', "monospace"],
      mono: ['"Source Code Pro"', "monospace"],
      sans: ['"Arimo"', "sans-serif"],
    },
  },
  plugins: [],
};
