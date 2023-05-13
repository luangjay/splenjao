/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      transitionProperty: {
        width: "width",
        margin: "margin",
      },
      keyframes: {
        border: {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
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
