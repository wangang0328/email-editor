import path from 'path'
import { fileURLToPath } from 'url'
import type { Config } from 'tailwindcss'

const configDir = path.dirname(fileURLToPath(import.meta.url))

const repoRoot = path.join(configDir, '..')

const config: Config = {
  darkMode: 'class',
  content: [
    path.join(configDir, 'src/**/*.{js,ts,jsx,tsx}'),
    path.join(repoRoot, 'packages/email-editor-ui/src/**/*.{js,ts,jsx,tsx}'),
    path.join(repoRoot, 'packages/email-editor-preset/src/**/*.{js,ts,jsx,tsx}'),
    path.join(repoRoot, 'packages/email-editor-panels/src/**/*.{js,ts,jsx,tsx}'),
    path.join(repoRoot, 'packages/email-editor-editor/src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderColor: {
        DEFAULT: 'hsl(var(--border))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      gridTemplateColumns: {
        '24': 'repeat(24, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-3': 'span 3 / span 3',
        'span-7': 'span 7 / span 7',
        'span-11': 'span 11 / span 11',
        'span-12': 'span 12 / span 12',
        'span-16': 'span 16 / span 16',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
