/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html','./src/**/*.{ts,tsx}'],
    theme: {
        extend: {
        colors: {
            brand: {
            50:  '#fff8f1',
            100: '#feeeda',
            200: '#fbd2a8',
            300: '#f5b678',
            400: '#ec9650',
            500: '#d97b35',
            600: '#bd6126',
            700: '#944a1b',
            800: '#6d3714',
            900: '#4a250e',
            },
            sand: { 50:'#faf6ef', 100:'#f3e8d8' }
        },
        borderRadius: { xl: '14px', '2xl': '20px' },
        boxShadow: { card: '0 2px 10px rgba(0,0,0,.06)' }
        }
    },
    plugins: [],
}
