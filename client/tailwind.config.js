/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // FFXIV-inspired color palette
                ffxiv: {
                    dark: '#1a1a2e',
                    darker: '#0f0f1a',
                    accent: '#d4af37',      // Gold
                    'accent-light': '#ffd700',
                    primary: '#4a6fa5',
                    secondary: '#8b5e3c',
                    success: '#4ade80',
                    warning: '#facc15',
                    danger: '#f87171',
                    miner: '#ff9c6e',       // Orange for Miner
                    botanist: '#95de64',    // Green for Botanist
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Cinzel', 'serif'],
            },
            animation: {
                'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                'pulse-gold': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
                    '50%': { boxShadow: '0 0 0 10px rgba(212, 175, 55, 0)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
        },
    },
    plugins: [],
}
