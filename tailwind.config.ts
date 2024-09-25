import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      dropShadow: {
        'center': "0 0px 2px rgba(0,0,0,0.20)"
      },
      keyframes: {
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
      },
      colors: {
        neutral: {
          50: "#FFFCFF",
          100: "#F6F6F6",
          200: "#E4E4E4",
          300: "#C9C9C9",
          400: "#AEAEAE",
          500: "#939393",
          600: "#787878",
          700: "#5D5D5D",
          800: "#424242",
          900: "#272727",
        },
        primary: {
          50: "#F7F6FE",
          100: "#E7E6FC",
          200: "#D0CEF9",
          300: "#B9B5F6",
          400: "#A19DF3",
          500: "#736CED",
          600: "#5F5AC5",
          700: "#4C489E",
          800: "#393676",
          900: "#26244F",
        },
        secondary: {
          50: "#F8F8FD",
          100: "#EBEBFB",
          200: "#D8D8F7",
          300: "#C5C5F4",
          400: "#B2B2F0",
          500: "#9F9FED",
          600: "#8484C5",
          700: "#6A6A9E",
          800: "#4F4F76",
          900: "#35354F",
        },
        accents: {
          500: "#C9D8FC",
          600: "#17183B",
          700: "#E5FFDE",
          800: "#F2DFD7",
          900: "#D7C7E2",
        },
        success: {
          50: "#D7F3E7",
          100: "#AFE7D0",
          200: "#87DCB8",
          300: "#5FD0A1",
          400: "#37C489",
          500: "#10B972",
          600: "#0D9A5F",
          700: "#0A7B4C",
          800: "#085C39",
          900: "#053D26",
        },
        error: {
          25: "#FDF2F2",
          50: "#FDECEC",
          100: "#FAC5C5",
          200: "#F8A9A9",
          300: "#F48282",
          400: "#F26969",
          500: "#EF4444",
          600: "#D93E3E",
          700: "#AA3030",
          800: "#832525",
          900: "#641D1D",
        },
      },
    },
  },
  plugins: [],
};
export default config;
