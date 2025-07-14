/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // scan all React files
  ],
  theme: {
    extend: {
      // keyframes: {
    //     fadeSlideUp: {
    //       '0%': { opacity: '0', transform: 'translateY(20px)' },
    //       '100%': { opacity: '1', transform: 'translateY(0)' },
    //     },
    //   },
    //   animation: {
    //     fadeSlideUp: 'fadeSlideUp 0.8s ease forwards',
    //   },},
    colors: {
        'primary-dark-brown': '#7B4019',
        'primary-orange': '#FF7D29',
        'light-orange': '#FFBF78',
        'light-cream': '#FFEEA9',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },  },
  plugins: [],
}

