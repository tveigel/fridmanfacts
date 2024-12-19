/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      width: {
        'sidebar': '500px',
      },
      minWidth: {
        'sidebar': '500px',
      },
      maxWidth: {
        'sidebar': '800px',
      }
    },
  },
  safelist: [
    'w-sidebar',
    'min-w-sidebar',
    'max-w-sidebar',
    'cursor-col-resize'
  ],
  plugins: [],
};