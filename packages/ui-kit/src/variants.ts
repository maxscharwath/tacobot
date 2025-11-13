/**
 * Common variant definitions for UI components using CVA
 * Ensures consistency across all components
 */

import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Tone variants - used for alerts, badges, status indicators
 */
export const toneVariants = cva('', {
  variants: {
    tone: {
      brand: 'border-brand-400/50 bg-brand-500/15 text-brand-50',
      success: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-50',
      warning: 'border-amber-400/50 bg-amber-500/15 text-amber-50',
      error: 'border-rose-400/50 bg-rose-500/15 text-rose-50',
      info: 'border-brand-400/40 bg-brand-500/10 text-brand-100',
      neutral: 'border-white/15 bg-slate-800/80 text-slate-200',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
});

export type Tone = VariantProps<typeof toneVariants>['tone'];

/**
 * Size variants
 */
export const sizeVariants = cva('', {
  variants: {
    size: {
      xs: 'h-7 px-3 text-xs',
      sm: 'h-9 px-4 text-xs',
      md: 'h-11 px-5 text-sm',
      lg: 'h-12 px-6 text-base',
      xl: 'h-14 px-8 text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type Size = VariantProps<typeof sizeVariants>['size'];

/**
 * Color styles for different variants
 */
const colorStyles = {
  brand: {
    border: 'border-brand-400/50',
    bg: 'bg-brand-500/20',
    text: 'text-brand-50',
    shadow: 'shadow-[0_12px_40px_rgba(99,102,241,0.25)]',
    hoverBorder: 'hover:border-brand-400/60',
    hoverBg: 'hover:bg-brand-500/30',
    hoverText: 'hover:text-brand-50',
  },
  rose: {
    border: 'border-rose-400/50',
    bg: 'bg-rose-500/20',
    text: 'text-rose-50',
    shadow: 'shadow-[0_12px_40px_rgba(244,114,182,0.25)]',
    hoverBorder: 'hover:border-rose-400/60',
    hoverBg: 'hover:bg-rose-500/30',
    hoverText: 'hover:text-rose-50',
  },
  amber: {
    border: 'border-amber-400/50',
    bg: 'bg-amber-500/20',
    text: 'text-amber-50',
    shadow: 'shadow-[0_12px_40px_rgba(251,191,36,0.25)]',
    hoverBorder: 'hover:border-amber-400/60',
    hoverBg: 'hover:bg-amber-500/30',
    hoverText: 'hover:text-amber-50',
  },
  emerald: {
    border: 'border-emerald-400/50',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-50',
    shadow: 'shadow-[0_12px_40px_rgba(16,185,129,0.25)]',
    hoverBorder: 'hover:border-emerald-400/60',
    hoverBg: 'hover:bg-emerald-500/30',
    hoverText: 'hover:text-emerald-50',
  },
  violet: {
    border: 'border-violet-400/50',
    bg: 'bg-violet-500/20',
    text: 'text-violet-50',
    shadow: 'shadow-[0_12px_40px_rgba(167,139,250,0.25)]',
    hoverBorder: 'hover:border-violet-400/60',
    hoverBg: 'hover:bg-violet-500/30',
    hoverText: 'hover:text-violet-50',
  },
  sky: {
    border: 'border-sky-400/50',
    bg: 'bg-sky-500/20',
    text: 'text-sky-50',
    shadow: 'shadow-[0_12px_40px_rgba(14,165,233,0.25)]',
    hoverBorder: 'hover:border-sky-400/60',
    hoverBg: 'hover:bg-sky-500/30',
    hoverText: 'hover:text-sky-50',
  },
  cyan: {
    border: 'border-cyan-400/50',
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-50',
    shadow: 'shadow-[0_12px_40px_rgba(34,211,238,0.25)]',
    hoverBorder: 'hover:border-cyan-400/60',
    hoverBg: 'hover:bg-cyan-500/30',
    hoverText: 'hover:text-cyan-50',
  },
} as const;

/**
 * Button variant styles
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
  {
    variants: {
      variant: {
        primary: '',
        secondary: '',
        outline: '',
        ghost: '',
        danger: '',
        tab: '',
      },
      color: {
        brand: '',
        rose: '',
        amber: '',
        emerald: '',
        violet: '',
        sky: '',
        cyan: '',
      },
      pill: {
        true: 'rounded-full',
        false: 'rounded-xl',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    compoundVariants: [
      // Primary variant
      {
        variant: 'primary',
        color: undefined,
        pill: false,
        class: 'border border-brand-400/50 bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-[0_20px_50px_rgba(99,102,241,0.35)] hover:border-brand-300 hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60',
      },
      {
        variant: 'primary',
        color: 'brand',
        pill: false,
        class: 'border border-brand-400/50 bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-[0_20px_50px_rgba(99,102,241,0.35)] hover:border-brand-300 hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60',
      },
      {
        variant: 'primary',
        color: 'rose',
        pill: false,
        class: 'border border-rose-400/50 bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-[0_20px_50px_rgba(244,114,182,0.35)] hover:border-rose-300 hover:from-rose-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/50 disabled:opacity-60',
      },
      {
        variant: 'primary',
        color: 'amber',
        pill: false,
        class: 'border border-amber-400/50 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-[0_20px_50px_rgba(251,191,36,0.35)] hover:border-amber-300 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-60',
      },
      {
        variant: 'primary',
        color: 'emerald',
        pill: false,
        class: 'border border-emerald-400/50 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_20px_50px_rgba(16,185,129,0.35)] hover:border-emerald-300 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60',
      },
      {
        variant: 'primary',
        color: 'violet',
        pill: false,
        class: 'border border-violet-400/50 bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-[0_20px_50px_rgba(167,139,250,0.35)] hover:border-violet-300 hover:from-violet-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-60',
      },
      {
        variant: 'primary',
        color: 'sky',
        pill: false,
        class: 'border border-sky-400/50 bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-[0_20px_50px_rgba(14,165,233,0.35)] hover:border-sky-300 hover:from-sky-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-60',
      },
      {
        variant: 'primary',
        color: 'cyan',
        pill: false,
        class: 'border border-cyan-400/50 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-[0_20px_50px_rgba(34,211,238,0.35)] hover:border-cyan-300 hover:from-cyan-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-60',
      },
      // Primary variant with pill
      {
        variant: 'primary',
        color: undefined,
        pill: true,
        class: 'border border-brand-400/50 bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-[0_20px_50px_rgba(99,102,241,0.35)] hover:border-brand-300 hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60',
      },
      {
        variant: 'primary',
        color: 'brand',
        pill: true,
        class: 'border border-brand-400/50 bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-[0_20px_50px_rgba(99,102,241,0.35)] hover:border-brand-300 hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60',
      },
      {
        variant: 'primary',
        color: 'rose',
        pill: true,
        class: 'border border-rose-400/50 bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-[0_20px_50px_rgba(244,114,182,0.35)] hover:border-rose-300 hover:from-rose-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/50 disabled:opacity-60',
      },
      {
        variant: 'primary',
        color: 'amber',
        pill: true,
        class: 'border border-amber-400/50 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-[0_20px_50px_rgba(251,191,36,0.35)] hover:border-amber-300 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-60',
      },
      {
        variant: 'primary',
        color: 'emerald',
        pill: true,
        class: 'border border-emerald-400/50 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_20px_50px_rgba(16,185,129,0.35)] hover:border-emerald-300 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60',
      },
      {
        variant: 'primary',
        color: 'violet',
        pill: true,
        class: 'border border-violet-400/50 bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-[0_20px_50px_rgba(167,139,250,0.35)] hover:border-violet-300 hover:from-violet-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-60',
      },
      {
        variant: 'primary',
        color: 'sky',
        pill: true,
        class: 'border border-sky-400/50 bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-[0_20px_50px_rgba(14,165,233,0.35)] hover:border-sky-300 hover:from-sky-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-60',
      },
      {
        variant: 'primary',
        color: 'cyan',
        pill: true,
        class: 'border border-cyan-400/50 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-[0_20px_50px_rgba(34,211,238,0.35)] hover:border-cyan-300 hover:from-cyan-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-60',
      },
      // Secondary variant
      {
        variant: 'secondary',
        color: undefined,
        class: 'border border-white/10 bg-slate-900/80 text-white hover:border-brand-400/40 hover:text-brand-50 disabled:opacity-60',
      },
      {
        variant: 'secondary',
        color: 'brand',
        class: 'border border-brand-400/30 bg-slate-900/80 text-white hover:border-brand-400/50 hover:bg-brand-500/10 hover:text-brand-50 disabled:opacity-60',
      },
      {
        variant: 'secondary',
        color: 'rose',
        class: 'border border-rose-400/30 bg-slate-900/80 text-white hover:border-rose-400/50 hover:bg-rose-500/10 hover:text-rose-50 disabled:opacity-60',
      },
      {
        variant: 'secondary',
        color: 'amber',
        class: 'border border-amber-400/30 bg-slate-900/80 text-white hover:border-amber-400/50 hover:bg-amber-500/10 hover:text-amber-50 disabled:opacity-60',
      },
      {
        variant: 'secondary',
        color: 'emerald',
        class: 'border border-emerald-400/30 bg-slate-900/80 text-white hover:border-emerald-400/50 hover:bg-emerald-500/10 hover:text-emerald-50 disabled:opacity-60',
      },
      {
        variant: 'secondary',
        color: 'violet',
        class: 'border border-violet-400/30 bg-slate-900/80 text-white hover:border-violet-400/50 hover:bg-violet-500/10 hover:text-violet-50 disabled:opacity-60',
      },
      {
        variant: 'secondary',
        color: 'sky',
        class: 'border border-sky-400/30 bg-slate-900/80 text-white hover:border-sky-400/50 hover:bg-sky-500/10 hover:text-sky-50 disabled:opacity-60',
      },
      {
        variant: 'secondary',
        color: 'cyan',
        class: 'border border-cyan-400/30 bg-slate-900/80 text-white hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-50 disabled:opacity-60',
      },
      // Outline variant - color only affects border and text
      {
        variant: 'outline',
        color: undefined,
        class: 'border border-white/20 text-slate-100 hover:border-brand-400/60 hover:text-brand-50 disabled:opacity-60',
      },
      {
        variant: 'outline',
        color: 'brand',
        class: 'border border-brand-400/50 text-brand-50 hover:border-brand-400/70 hover:text-brand-50 disabled:opacity-60',
      },
      {
        variant: 'outline',
        color: 'rose',
        class: 'border border-rose-400/50 text-rose-50 hover:border-rose-400/70 hover:text-rose-50 disabled:opacity-60',
      },
      {
        variant: 'outline',
        color: 'amber',
        class: 'border border-amber-400/50 text-amber-50 hover:border-amber-400/70 hover:text-amber-50 disabled:opacity-60',
      },
      {
        variant: 'outline',
        color: 'emerald',
        class: 'border border-emerald-400/50 text-emerald-50 hover:border-emerald-400/70 hover:text-emerald-50 disabled:opacity-60',
      },
      {
        variant: 'outline',
        color: 'violet',
        class: 'border border-violet-400/50 text-violet-50 hover:border-violet-400/70 hover:text-violet-50 disabled:opacity-60',
      },
      {
        variant: 'outline',
        color: 'sky',
        class: 'border border-sky-400/50 text-sky-50 hover:border-sky-400/70 hover:text-sky-50 disabled:opacity-60',
      },
      {
        variant: 'outline',
        color: 'cyan',
        class: 'border border-cyan-400/50 text-cyan-50 hover:border-cyan-400/70 hover:text-cyan-50 disabled:opacity-60',
      },
      // Ghost variant - color affects text and hover (with border)
      {
        variant: 'ghost',
        color: undefined,
        class: 'border border-transparent text-slate-200 hover:border-white/10 hover:bg-slate-800/60 hover:text-brand-50',
      },
      {
        variant: 'ghost',
        color: 'brand',
        class: 'border border-transparent text-brand-50 hover:border-brand-400/30 hover:bg-brand-500/10 hover:text-brand-50',
      },
      {
        variant: 'ghost',
        color: 'rose',
        class: 'border border-transparent text-rose-50 hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-50',
      },
      {
        variant: 'ghost',
        color: 'amber',
        class: 'border border-transparent text-amber-50 hover:border-amber-400/30 hover:bg-amber-500/10 hover:text-amber-50',
      },
      {
        variant: 'ghost',
        color: 'emerald',
        class: 'border border-transparent text-emerald-50 hover:border-emerald-400/30 hover:bg-emerald-500/10 hover:text-emerald-50',
      },
      {
        variant: 'ghost',
        color: 'violet',
        class: 'border border-transparent text-violet-50 hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-50',
      },
      {
        variant: 'ghost',
        color: 'sky',
        class: 'border border-transparent text-sky-50 hover:border-sky-400/30 hover:bg-sky-500/10 hover:text-sky-50',
      },
      {
        variant: 'ghost',
        color: 'cyan',
        class: 'border border-transparent text-cyan-50 hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-50',
      },
      // Danger variant (no color override)
      {
        variant: 'danger',
        class: 'border border-rose-400/40 bg-rose-500/15 text-rose-50 hover:border-rose-300 hover:bg-rose-500/25 disabled:opacity-60',
      },
      // Tab variant - styled as role="tab" buttons with specific styling
      {
        variant: 'tab',
        color: undefined,
        class: 'flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 font-semibold text-sm uppercase tracking-[0.2em] text-slate-300 transition hover:border-brand-400/40 hover:text-brand-50 disabled:opacity-60',
      },
      {
        variant: 'tab',
        color: 'brand',
        class: `flex items-center gap-2 rounded-full border px-4 py-2 font-semibold text-sm uppercase tracking-[0.2em] transition ${colorStyles.brand.border} ${colorStyles.brand.hoverBorder} ${colorStyles.brand.bg} ${colorStyles.brand.text} ${colorStyles.brand.shadow} disabled:opacity-60`,
      },
      {
        variant: 'tab',
        color: 'rose',
        class: `flex items-center gap-2 rounded-full border px-4 py-2 font-semibold text-sm uppercase tracking-[0.2em] transition ${colorStyles.rose.border} ${colorStyles.rose.hoverBorder} ${colorStyles.rose.bg} ${colorStyles.rose.text} ${colorStyles.rose.shadow} disabled:opacity-60`,
      },
      {
        variant: 'tab',
        color: 'amber',
        class: `flex items-center gap-2 rounded-full border px-4 py-2 font-semibold text-sm uppercase tracking-[0.2em] transition ${colorStyles.amber.border} ${colorStyles.amber.hoverBorder} ${colorStyles.amber.bg} ${colorStyles.amber.text} ${colorStyles.amber.shadow} disabled:opacity-60`,
      },
      {
        variant: 'tab',
        color: 'emerald',
        class: `flex items-center gap-2 rounded-full border px-4 py-2 font-semibold text-sm uppercase tracking-[0.2em] transition ${colorStyles.emerald.border} ${colorStyles.emerald.hoverBorder} ${colorStyles.emerald.bg} ${colorStyles.emerald.text} ${colorStyles.emerald.shadow} disabled:opacity-60`,
      },
      {
        variant: 'tab',
        color: 'violet',
        class: `flex items-center gap-2 rounded-full border px-4 py-2 font-semibold text-sm uppercase tracking-[0.2em] transition ${colorStyles.violet.border} ${colorStyles.violet.hoverBorder} ${colorStyles.violet.bg} ${colorStyles.violet.text} ${colorStyles.violet.shadow} disabled:opacity-60`,
      },
      {
        variant: 'tab',
        color: 'sky',
        class: `flex items-center gap-2 rounded-full border px-4 py-2 font-semibold text-sm uppercase tracking-[0.2em] transition ${colorStyles.sky.border} ${colorStyles.sky.hoverBorder} ${colorStyles.sky.bg} ${colorStyles.sky.text} ${colorStyles.sky.shadow} disabled:opacity-60`,
      },
      {
        variant: 'tab',
        color: 'cyan',
        class: `flex items-center gap-2 rounded-full border px-4 py-2 font-semibold text-sm uppercase tracking-[0.2em] transition ${colorStyles.cyan.border} ${colorStyles.cyan.hoverBorder} ${colorStyles.cyan.bg} ${colorStyles.cyan.text} ${colorStyles.cyan.shadow} disabled:opacity-60`,
      },
    ],
    defaultVariants: {
      variant: 'primary',
      pill: false,
      size: 'md',
      fullWidth: false,
    },
  }
);

export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
export type ButtonColor = VariantProps<typeof buttonVariants>['color'];
