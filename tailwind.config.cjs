/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     '#030712',
          surface:  '#0a0f1e',
          elevated: '#0f172a',
          overlay:  '#1e293b',
        },
        border: {
          DEFAULT: '#1e2d45',
          bright:  '#2d4a6e',
        },
        accent: {
          cyan:   '#00d4ff',
          green:  '#00ff94',
          purple: '#7c3aed',
          orange: '#ff6b35',
          red:    '#ff3d5a',
          yellow: '#ffd93d',
        },
        text: {
          primary:   '#e2e8f0',
          secondary: '#64748b',
          muted:     '#334155',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono:    ['"Space Mono"', 'monospace'],
        body:    ['Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        xs:    ['11px', { lineHeight: '16px' }],
        sm:    ['12px', { lineHeight: '18px' }],
        base:  ['13px', { lineHeight: '20px' }],
        md:    ['14px', { lineHeight: '22px' }],
        lg:    ['16px', { lineHeight: '24px' }],
        xl:    ['18px', { lineHeight: '28px' }],
        '2xl': ['22px', { lineHeight: '30px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '44px' }],
      },
      borderRadius: {
        sm:  '4px',
        md:  '8px',
        lg:  '12px',
        xl:  '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'glow-cyan':   '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-green':  '0 0 20px rgba(0, 255, 148, 0.3)',
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.3)',
        'glow-red':    '0 0 20px rgba(255, 61, 90, 0.3)',
        'card':        '0 4px 24px rgba(0, 0, 0, 0.4)',
        'modal':       '0 24px 64px rgba(0, 0, 0, 0.6)',
        'inner-cyan':  'inset 0 0 0 1px rgba(0, 212, 255, 0.2)',
      },
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
        `,
        'radial-glow': `
          radial-gradient(ellipse at center,
            rgba(0,212,255,0.06) 0%,
            rgba(124,58,237,0.04) 40%,
            transparent 70%
          )
        `,
        'gradient-cyan':  'linear-gradient(135deg, #00d4ff, #00ff94)',
        'gradient-brand': 'linear-gradient(135deg, #00d4ff, #7c3aed)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1',   transform: 'scale(1)'    },
          '50%':       { opacity: '0.6', transform: 'scale(1.15)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to:   { opacity: '1', transform: 'translateY(0)'     },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateX(20px) scale(0.95)' },
          to:   { opacity: '1', transform: 'translateX(0)    scale(1)'    },
        },
        modalIn: {
          from: { opacity: '0', transform: 'scale(0.92) translateY(16px)' },
          to:   { opacity: '1', transform: 'scale(1)    translateY(0)'    },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        ticker: {
          from: { transform: 'translateX(0)'    },
          to:   { transform: 'translateX(-50%)' },
        },
        scanline: {
          from: { transform: 'translateY(-100%)' },
          to:   { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 98%, 100%': { opacity: '1'   },
          '99%':            { opacity: '0.6' },
        },
      },
      animation: {
        'pulse':    'pulse 2s ease-in-out infinite',
        'shimmer':  'shimmer 1.5s linear infinite',
        'fadeIn':   'fadeIn 200ms ease both',
        'slideUp':  'slideUp 250ms cubic-bezier(0.4,0,0.2,1) both',
        'slideDown':'slideDown 250ms cubic-bezier(0.4,0,0.2,1) both',
        'toastIn':  'toastIn 250ms cubic-bezier(0.34,1.56,0.64,1) both',
        'modalIn':  'modalIn 250ms cubic-bezier(0.34,1.56,0.64,1) both',
        'spin':     'spin 600ms linear infinite',
        'ticker':   'ticker 20s linear infinite',
        'scanline': 'scanline 4s linear infinite',
        'flicker':  'flicker 8s linear infinite',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      spacing: {
        '18': '72px',
        '22': '88px',
        '68': '272px',
        '72': '288px',
        '76': '304px',
        '84': '336px',
        '88': '352px',
        '92': '368px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};
