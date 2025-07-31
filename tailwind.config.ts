import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'cyber': ['Orbitron', 'sans-serif'],
				'mono': ['JetBrains Mono', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))'
				},
				agent: {
					developer: 'hsl(var(--agent-developer))',
					designer: 'hsl(var(--agent-designer))',
					analyst: 'hsl(var(--agent-analyst))',
					writer: 'hsl(var(--agent-writer))',
					manager: 'hsl(var(--agent-manager))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-chaos': 'var(--gradient-chaos)',
				'gradient-corruption': 'var(--gradient-corruption)'
			},
			boxShadow: {
				'glow': 'var(--shadow-glow)',
				'chaos': 'var(--shadow-chaos)',
				'corruption': 'var(--shadow-corruption)',
				'digital': 'var(--shadow-digital)'
			},
			transitionDuration: {
				'glitch': 'var(--animation-glitch)',
				'pulse': 'var(--animation-pulse)',
				'flicker': 'var(--animation-flicker)',
				'chaos': 'var(--animation-chaos)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'glitch': {
					'0%, 14%, 15%, 49%, 50%, 99%, 100%': { 
						transform: 'translate(0)',
					},
					'15%, 49%': { 
						transform: 'translate(-2px, 1px)',
					},
				},
				'chaos-pulse': {
					'0%, 100%': {
						boxShadow: '0 0 20px hsl(120 100% 50% / 0.4)',
						transform: 'scale(1)',
					},
					'50%': {
						boxShadow: '0 0 40px hsl(280 100% 65% / 0.6)',
						transform: 'scale(1.02)',
					},
				},
				'scan': {
					'0%': { 
						backgroundPosition: '0 0',
					},
					'100%': { 
						backgroundPosition: '0 100px',
					},
				},
				'flicker': {
					'0%, 100%': { 
						opacity: '1',
					},
					'50%': { 
						opacity: '0.8',
					},
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glitch': 'glitch 0.3s infinite linear',
				'chaos-pulse': 'chaos-pulse 2s infinite',
				'scan': 'scan 2s linear infinite',
				'flicker': 'flicker 0.15s linear infinite alternate'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
