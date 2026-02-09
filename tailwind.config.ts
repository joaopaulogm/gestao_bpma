import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
				/* Regulamento Identidade Visual PMDF 1.15: Myriad Pro padrão; fallback Source Sans 3 */
				pmdf: ['"Myriad Pro"', '"Myriad Web"', '"Source Sans 3"', '"Source Sans Pro"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				pmdfSecondary: ['"Nirmala UI"', '"Myriad Pro"', '"Source Sans 3"', 'sans-serif'],
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
					active: 'hsl(var(--sidebar-active))',
					'active-foreground': 'hsl(var(--sidebar-active-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				}
			},
			spacing: {
				// Apple HIG spacing system (4px base)
				'apple-xs': '4px',
				'apple-sm': '8px',
				'apple-md': '16px',
				'apple-lg': '24px',
				'apple-xl': '32px',
				'apple-2xl': '48px',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0',
						opacity: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					},
					to: {
						height: '0',
						opacity: '0'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.98)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-8px)'
					}
				},
				'pulse-soft': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.7'
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '200% 0'
					},
					'100%': {
						backgroundPosition: '-200% 0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)',
				'accordion-up': 'accordion-up 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)',
				'slide-up': 'slide-up 0.35s cubic-bezier(0.0, 0.0, 0.2, 1)',
				'fade-in': 'fade-in 0.3s cubic-bezier(0.0, 0.0, 0.2, 1)',
				'scale-in': 'scale-in 0.2s cubic-bezier(0.0, 0.0, 0.2, 1)',
				'float': 'float 6s ease-in-out infinite',
				'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
				'shimmer': 'shimmer 1.5s infinite',
			},
			transitionDuration: {
				'apple-fast': '150ms',
				'apple-normal': '250ms',
				'apple-slow': '350ms',
			},
			transitionTimingFunction: {
				'apple': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
				'apple-in': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
				'apple-out': 'cubic-bezier(0.4, 0.0, 1, 1)',
				'bounce-subtle': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
