import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        steel: '#8B9095',
        graphite: '#2A2D31',
        forge: '#1A1C1F',
        carbon: '#0D0E10',
        amber: '#F59E0B',
        'amber-dim': '#92600A',
        'steel-blue': '#3B82F6',
        'steel-blue-dim': '#1D4ED8',
      },
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        body: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      letterSpacing: {
        industrial: '0.25em',
        wide: '0.15em',
      },
    },
  },
  plugins: [],
}
export default config
