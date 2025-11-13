/**
 * Base component utilities
 * Provides common patterns and helpers for UI components
 */

import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from './utils';
import { baseStyles, borders, focusRings, textColors, transitions } from './tokens';

/**
 * Base props for all UI components
 */
export interface BaseProps {
  readonly className?: string;
  readonly children?: ReactNode;
}

/**
 * Base container component with consistent styling
 */
export function BaseContainer({
  className,
  children,
  ...props
}: BaseProps & ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn(baseStyles.card, className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Base input wrapper with consistent styling
 */
const inputWrapperVariants = cva('w-full', {
  variants: {
    error: {
      true: borders.error,
      false: borders.default,
    },
  },
  defaultVariants: {
    error: false,
  },
});

export function BaseInputWrapper({
  className,
  error,
  children,
  ...props
}: BaseProps & ComponentPropsWithoutRef<'div'> & VariantProps<typeof inputWrapperVariants>) {
  return (
    <div className={cn(inputWrapperVariants({ error }), transitions.default, className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Base text component with consistent typography
 */
const textVariants = cva('', {
  variants: {
    variant: {
      primary: textColors.primary,
      secondary: textColors.secondary,
      tertiary: textColors.tertiary,
      muted: textColors.muted,
    },
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export function BaseText({
  className,
  variant,
  size,
  children,
  ...props
}: BaseProps & ComponentPropsWithoutRef<'p'> & VariantProps<typeof textVariants>) {
  return (
    <p className={cn(textVariants({ variant, size }), className)} {...props}>
      {children}
    </p>
  );
}

/**
 * Base heading component with consistent typography
 */
const headingVariants = cva('', {
  variants: {
    level: {
      1: 'font-bold text-3xl',
      2: 'font-semibold text-2xl',
      3: 'font-semibold text-xl',
      4: 'font-semibold text-lg',
      5: 'font-semibold text-base',
      6: 'font-semibold text-sm',
    },
  },
  defaultVariants: {
    level: 2,
  },
});

export function BaseHeading({
  className,
  level,
  children,
  ...props
}: BaseProps &
  ComponentPropsWithoutRef<'h1'> &
  ComponentPropsWithoutRef<'h2'> &
  ComponentPropsWithoutRef<'h3'> &
  ComponentPropsWithoutRef<'h4'> &
  ComponentPropsWithoutRef<'h5'> &
  ComponentPropsWithoutRef<'h6'> &
  VariantProps<typeof headingVariants>) {
  const HeadingTag = `h${level ?? 2}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return (
    <HeadingTag
      className={cn(textColors.primary, headingVariants({ level }), className)}
      {...props}
    >
      {children}
    </HeadingTag>
  );
}

/**
 * Base interactive element with focus styles
 */
export function BaseInteractive({
  className,
  children,
  ...props
}: BaseProps & ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2',
        focusRings.default,
        transitions.default,
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
