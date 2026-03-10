/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
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
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
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
