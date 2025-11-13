# UI Kit Foundation

A simple, consistent UI kit system for harmonizing all frontend components.

## Structure

### 1. Design Tokens (`tokens.ts`)
Centralized design system values for consistent styling:
- **Radius**: Border radius tokens (sm, md, lg, full)
- **Spacing**: Padding/margin tokens
- **Borders**: Border styles for different states
- **Backgrounds**: Background color tokens
- **Shadows**: Shadow styles for elevation
- **Text Colors**: Text color variants
- **Transitions**: Transition utilities
- **Focus Rings**: Focus state styles
- **Base Styles**: Pre-composed styles for common components

### 2. Variants (`variants.ts`)
Common variant definitions shared across components:
- **Tone**: Semantic color variants (brand, success, warning, error, info, neutral)
- **Size**: Size variants (xs, sm, md, lg, xl)
- **ButtonVariant**: Button style variants (primary, secondary, outline, ghost, danger)

### 3. Base Components (`base.tsx`)
Reusable base components with consistent styling:
- **BaseContainer**: Container with card styling
- **BaseInputWrapper**: Input wrapper with error states
- **BaseText**: Typography component with variants
- **BaseHeading**: Heading component with semantic levels
- **BaseInteractive**: Interactive element with focus styles

## Usage

### Using Design Tokens

```tsx
import { radius, borders, backgrounds, shadows } from '@/components/ui';

function MyComponent() {
  return (
    <div className={cn(radius.md, borders.default, backgrounds.card, shadows.card)}>
      Content
    </div>
  );
}
```

### Using Variants (CVA)

```tsx
import { buttonVariants } from '@/components/ui';
import { cn } from '@/lib/utils';

function MyButton({ variant = 'primary', size = 'md' }) {
  return (
    <button className={cn(buttonVariants({ variant, size }))}>
      Click me
    </button>
  );
}
```

### Using Base Components

```tsx
import { BaseContainer, BaseText, BaseHeading } from '@/components/ui';

function MyCard() {
  return (
    <BaseContainer>
      <BaseHeading level={2}>Title</BaseHeading>
      <BaseText variant="secondary">Description</BaseText>
    </BaseContainer>
  );
}
```

## Benefits

1. **Consistency**: All components use the same design tokens
2. **Maintainability**: Update styles in one place
3. **Type Safety**: TypeScript ensures correct usage
4. **Harmonization**: Easy to align all components with the design system

