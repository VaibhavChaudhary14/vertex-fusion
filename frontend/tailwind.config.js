/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neo: {
                    bg: '#E0E7F1',       // Light grey-blue background (or plain white)
                    card: '#FFFFFF',     // White cards
                    dark: '#0e1111',     // Almost black

                    primary: '#8B5CF6',  // Neon Purple
                    secondary: '#10B981',// Neon Green
                    accent: '#F43F5E',   // Hot Pink
                    warning: '#F59E0B',  // Amber
                }
            },
            boxShadow: {
                'neo': '5px 5px 0px 0px rgba(0,0,0,1)',      // Hard shadow
                'neo-sm': '2px 2px 0px 0px rgba(0,0,0,1)',   // Small hard shadow
                'neo-lg': '8px 8px 0px 0px rgba(0,0,0,1)',   // Large hard shadow
            },
            borderWidth: {
                '3': '3px',
            },
            fontFamily: {
                mono: ['Space Mono', 'monospace'],
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
