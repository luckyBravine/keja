// const { createGlobPatternsForDependencies } = require('@nx/next/tailwind');

// The above utility import will not work if you are using Next.js' --turbo.
// Instead you will have to manually add the dependent paths to be included.
// For example
// ../libs/buttons/**/*.{ts,tsx,js,jsx,html}',                 <--- Adding a shared lib
// !../libs/buttons/**/*.{stories,spec}.{ts,tsx,js,jsx,html}', <--- Skip adding spec/stories files from shared lib

// If you are **not** using `--turbo` you can uncomment both lines 1 & 19.
// A discussion of the issue can be found: https://github.com/nrwl/nx/issues/26510

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    './app/**/*.{js,ts,jsx,tsx}', // Include app/ directory
    './components/**/*.{js,ts,jsx,tsx}', // Include components/ directory
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8', // Example blue
        secondary: '#9333EA', // Example purple
        accent: '#10B981', // Example green
        neutral: '#F9FAFB', // Example light gray
      },
    },
  },
  plugins: [],
};
