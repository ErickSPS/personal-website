/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Classic Blue (Primary)
        primary: {
          DEFAULT: "#0A3D62",
          light: "#1B5A84",
          dark: "#082C47",
          foreground: "#FFFFFF",
        },
        // Turquoise (Secondary)
        secondary: {
          DEFAULT: "#2DBBB8",
          light: "#40D6D3",
          dark: "#1F8C89",
          foreground: "#FFFFFF",
        },
        // Gold (Accent)
        accent: {
          DEFAULT: "#FFB142",
          light: "#FFC168",
          dark: "#E69422",
          foreground: "#000000",
        },
        // Background and Text Colors
        background: {
          DEFAULT: "#FFFFFF",
          dark: "#0F172A",
        },
        text: {
          DEFAULT: "#1A1A1A",
          muted: "#666666",
          dark: "#FFFFFF",
          "dark-muted": "#A0AEC0",
        },
        border: {
          DEFAULT: "#E2E8F0",
          dark: "#2D3748",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
} 