/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      transitionProperty: {
        width: "width",
        margin: "margin",
      },
      translate: {
        "z-0": {
          z: "0%",
        },
      },
    },
    fontFamily: {
      number: ['"Source Sans Pro"', "monospace"],
      mono: ['"Source Code Pro"', "monospace"],
      sans: ['"Inter"', "sans-serif"],
    },
  },
  plugins: [],
};
