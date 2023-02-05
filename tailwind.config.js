/** @type {import('tailwindcss').Config} */

const { hairlineWidth, platformSelect } = require("nativewind/dist/theme-functions");

module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "breathly-serif-medium": ["Lora-Medium"],
        "breathly-serif-semibold": ["Lora-SemiBold"],
        "breathly-regular": ["GeneralSans-Regular"],
        "breathly-medium": ["GeneralSans-Medium"],
        "breathly-mono": [
          platformSelect({ ios: "HelveticaNeue-Light", android: "sans-serif-thin" }),
        ],
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      spacing: {
        hairline: hairlineWidth(),
      },
    },
  },
  plugins: [],
};
