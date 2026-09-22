import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx,js,jsx,mdx}',
    './components/**/*.{ts,tsx,js,jsx,mdx}',
    './app/**/*.{ts,tsx,js,jsx,mdx}',
    './src/**/*.{ts,tsx,js,jsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
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
        // Named chart colors for recharts
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in": "slide-in-from-top 0.15s ease-out",
        "fade-in": "fade-in 0.15s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), daisyui],
  daisyui: {
    themes: [
      {
        light: {
          "color-scheme": "light",
          "primary": "hsl(160, 84%, 39%)",
          "primary-content": "#ffffff",
          "secondary": "hsl(210, 40%, 96%)",
          "secondary-content": "hsl(222, 47%, 11%)",
          "accent": "hsl(210, 40%, 96%)",
          "accent-content": "hsl(222, 47%, 11%)",
          "neutral": "hsl(222, 47%, 11%)",
          "neutral-content": "#ffffff",
          "base-100": "hsl(0, 0%, 100%)",
          "base-200": "hsl(210, 40%, 96%)",
          "base-300": "hsl(214, 32%, 91%)",
          "base-content": "hsl(222, 84%, 5%)",
          "error": "hsl(0, 84%, 60%)",
          "error-content": "#ffffff",
          "success": "hsl(142, 71%, 45%)",
          "success-content": "#ffffff",
          "warning": "hsl(38, 92%, 50%)",
          "warning-content": "#ffffff",
          "info": "hsl(217, 91%, 60%)",
          "info-content": "#ffffff",
        },
      },
      {
        dark: {
          "color-scheme": "dark",
          "primary": "hsl(160, 84%, 39%)",
          "primary-content": "#ffffff",
          "secondary": "hsl(217, 33%, 18%)",
          "secondary-content": "hsl(210, 40%, 98%)",
          "accent": "hsl(217, 33%, 18%)",
          "accent-content": "hsl(210, 40%, 98%)",
          "neutral": "hsl(218, 33%, 14%)",
          "neutral-content": "hsl(210, 40%, 98%)",
          "base-100": "hsl(222, 47%, 9%)",
          "base-200": "hsl(222, 47%, 11%)",
          "base-300": "hsl(217, 32%, 17%)",
          "base-content": "hsl(210, 40%, 97%)",
          "error": "hsl(0, 63%, 31%)",
          "error-content": "hsl(210, 40%, 98%)",
          "success": "hsl(142, 71%, 45%)",
          "success-content": "#ffffff",
          "warning": "hsl(38, 92%, 50%)",
          "warning-content": "#000000",
          "info": "hsl(217, 91%, 60%)",
          "info-content": "#ffffff",
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
};
