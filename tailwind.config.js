/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F7FB',
        ink: { DEFAULT: '#1C2433', sub: '#5A6B84', faint: '#8896AC' },
        brand: { DEFAULT: '#2F6BEF', deep: '#1E4FD6', soft: '#EBF1FE', ghost: '#F5F8FF' },
        line: { DEFAULT: '#E3E9F2', strong: '#D3DCE9' },
        danger: { DEFAULT: '#E2554D', soft: '#FDEDEC' },
        success: { DEFAULT: '#0F9B6C', soft: '#E7F6F0' },
        warn: { DEFAULT: '#C07C1B', soft: '#FCF3E3' },
        note: { DEFAULT: '#D9A400', soft: '#FBF5DC' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,36,51,.04), 0 4px 16px rgba(28,36,51,.06)',
        lift: '0 8px 32px rgba(28,36,51,.12)',
      },
      fontFamily: {
        sans: [
          '"Hiragino Kaku Gothic ProN"',
          '"Hiragino Sans"',
          '"Noto Sans JP"',
          '"Yu Gothic UI"',
          'system-ui',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
