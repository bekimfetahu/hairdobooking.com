import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Button - Lovable Design System
 * Enhanced button component with multiple variants based on Lovable design patterns
 * 
 * Variants:
 * - default: Soft black background, white text (primary action)
 * - outline: Border with transparent bg, hover background
 * - secondary: Light gray background
 * - ghost: No border, hover background only
 * - destructive: Red background for dangerous actions
 * - link: Text link with underline on hover
 * 
 * Sizes:
 * - sm: Small (h-9)
 * - default: Regular (h-10)
 * - lg: Large (h-11)
 * - icon: Square icons (h-10 w-10)
 */
export default function Button({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false,
  loading = false,
  icon = null,
  asChild = false,
  ...props
}) {
  const baseStyles = cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-md text-sm font-medium cursor-pointer transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E62E2E]',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    loading && 'opacity-70 cursor-wait'
  );

  const variantStyles = {
    default: cn(
      'bg-[#333333] text-white hover:bg-[#404040]',
      'active:bg-[#2a2a2a]',
      'shadow-sm hover:shadow-md'
    ),
    outline: cn(
      'border border-gray-300 bg-white text-[#333333]',
      'hover:bg-gray-50 hover:border-gray-400',
      'active:bg-gray-100'
    ),
    secondary: cn(
      'bg-gray-100 text-[#333333]',
      'hover:bg-gray-200',
      'active:bg-gray-300'
    ),
    destructive: cn(
      'bg-[#E62E2E] text-white hover:bg-[#D63030]',
      'active:bg-[#C41E1E]',
      'shadow-sm hover:shadow-md'
    ),
    ghost: cn(
      'text-[#333333]',
      'hover:bg-gray-100',
      'active:bg-gray-200'
    ),
    link: cn(
      'text-[#E62E2E] underline-offset-4',
      'hover:underline',
      'focus:ring-0'
    ),
  };

  const sizeStyles = {
    sm: 'h-9 px-3 rounded-md text-xs',
    default: 'h-10 px-4 py-2 text-sm',
    lg: 'h-11 px-8 rounded-md text-base',
    icon: 'h-10 w-10',
    'pill-sm': 'h-9 px-4 rounded-full text-sm',
    'pill-lg': 'h-12 px-8 rounded-full text-base',
  };

  const Component = asChild ? React.Fragment : 'button';
  const componentProps = asChild ? {} : { type: 'button', disabled };

  return (
    <Component
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...componentProps}
      {...props}
    >
      {loading && (
        <span className="inline-block animate-spin">
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      {icon && !loading && <span className="flex">{icon}</span>}
      {children}
    </Component>
  );
}

/**
 * ButtonGroup - Display multiple buttons together
 * 
 * Usage:
 * <ButtonGroup>
 *   <Button>Save</Button>
 *   <Button variant="outline">Cancel</Button>
 * </ButtonGroup>
 */
export function ButtonGroup({ children, direction = 'horizontal', className = '' }) {
  return (
    <div
      className={cn(
        'flex gap-2',
        direction === 'vertical' && 'flex-col',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * PillButton - Rounded button (Lovable style)
 * Pill-shaped button for primary actions
 */
export function PillButton({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}) {
  const sizeToRounded = {
    sm: 'rounded-full h-9 px-5',
    default: 'rounded-full h-10 px-6',
    lg: 'rounded-full h-12 px-8',
  };

  return (
    <Button
      variant={variant}
      className={cn(sizeToRounded[size], className)}
      {...props}
    >
      {children}
    </Button>
  );
}

/**
 * IconButton - Square icon-only button
 * 
 * Usage:
 * <IconButton>
 *   <ChevronLeft />
 * </IconButton>
 */
export function IconButton({
  children,
  variant = 'ghost',
  className = '',
  rounded = 'md',
  ...props
}) {
  const roundedStyles = {
    md: 'rounded-md',
    full: 'rounded-full',
    lg: 'rounded-lg',
  };

  return (
    <Button
      size="icon"
      variant={variant}
      className={cn(roundedStyles[rounded], className)}
      {...props}
    >
      {children}
    </Button>
  );
}
