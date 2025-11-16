/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3ecff',
          100: '#e6d9ff',
          300: '#9f67ff',
          400: '#7f3dff',
          500: '#6a24e6',
          600: '#5a14cc',
          700: '#44109a',
        },
        surface: {
          DEFAULT: '#ffffff',
          100: '#fbf9ff',
          border: 'rgba(99,60,255,0.12)',
        },
        text: {
          primary: '#1f1f2e',
          muted: '#6b6b7a',
        },
        danger: '#e23d5b',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '16px',
        '4': '24px',
        '5': '32px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
      },
      boxShadow: {
        soft: '0 6px 30px rgba(104,61,255,0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}