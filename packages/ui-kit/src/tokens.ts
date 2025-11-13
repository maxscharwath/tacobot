/**
 * Design tokens for the UI kit
 * Centralized design system values for consistent styling
 */

/**
 * Border radius tokens
 */
export const radius = {
  sm: 'rounded-xl',
  md: 'rounded-2xl',
  lg: 'rounded-3xl',
  full: 'rounded-full',
} as const;

/**
 * Spacing tokens (padding/margin)
 */
export const spacing = {
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
} as const;

/**
 * Border styles
 */
export const borders = {
  default: 'border border-white/10',
  hover: 'border-white/20',
  focus: 'border-brand-400',
  error: 'border-rose-400/50',
  success: 'border-emerald-400/50',
  warning: 'border-amber-400/50',
} as const;

/**
 * Background styles
 */
export const backgrounds = {
  card: 'bg-slate-900/70',
  input: 'bg-slate-950/60',
  hover: 'bg-slate-800/60',
  overlay: 'bg-slate-950/80',
} as const;

/**
 * Shadow styles
 */
export const shadows = {
  card: 'shadow-[0_30px_90px_rgba(8,47,73,0.35)]',
  button: 'shadow-[0_20px_60px_rgba(99,102,241,0.35)]',
  badge: 'shadow-[0_10px_30px_rgba(99,102,241,0.35)]',
  none: 'shadow-none',
} as const;

/**
 * Text colors
 */
export const textColors = {
  primary: 'text-white',
  secondary: 'text-slate-200',
  tertiary: 'text-slate-300',
  muted: 'text-slate-400',
  placeholder: 'text-slate-500',
  brand: 'text-brand-50',
  error: 'text-rose-50',
  success: 'text-emerald-50',
  warning: 'text-amber-50',
} as const;

/**
 * Transition utilities
 */
export const transitions = {
  default: 'transition-colors',
  all: 'transition-all',
  transform: 'transition-transform',
} as const;

/**
 * Focus ring styles
 */
export const focusRings = {
  default:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
  input: 'focus:outline-none focus:ring-2 focus:ring-brand-400/40',
  error: 'focus:ring-rose-400/40',
} as const;

/**
 * Common component base styles
 */
export const baseStyles = {
  card: `${radius.lg} ${borders.default} ${backgrounds.card} ${shadows.card} backdrop-blur`,
  input: `${radius.md} ${borders.default} ${backgrounds.input} ${textColors.primary}`,
  button: `${radius.full} font-semibold ${transitions.all}`,
} as const;
