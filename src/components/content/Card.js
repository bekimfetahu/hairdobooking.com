'use client';
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Card - Lovable Design Pattern
 * Flexible card component with overlay, gradient, and hover effects
 * 
 * Variants:
 * - simple: Basic white card with border
 * - image-overlay: Image with theme overlay and text at bottom
 * - testimonial: Quote card with text and author
 * 
 * Usage:
 * <Card variant="image-overlay">
 *   <img src="..." alt="..." />
 *   <p>Content</p>
 * </Card>
 */
export default function Card({
  variant = 'simple',
  className = '',
  children,
  rounded = 'md',
  border = true,
  shadow = true,
  hover = true,
  onClick = null,
  ...props
}) {
  const baseStyles = cn(
    'transition-all duration-300',
    rounded === 'full' && 'rounded-full',
    rounded === '2xl' && 'rounded-2xl',
    rounded === 'lg' && 'rounded-lg',
    rounded === 'md' && 'rounded-md',
    border && 'border border-black/10',
    shadow && 'shadow-sm',
    hover && 'hover:border-black/20 hover:shadow-md',
    onClick && 'cursor-pointer'
  );

  const variantStyles = {
    simple: cn(
      'bg-white p-6',
      baseStyles
    ),
    'image-overlay': cn(
      'relative overflow-hidden group',
      baseStyles
    ),
    testimonial: cn(
      'bg-white p-8',
      baseStyles
    ),
    stat: cn(
      'bg-white text-center p-6',
      baseStyles
    ),
    category: cn(
      'relative overflow-hidden aspect-square',
      baseStyles
    ),
  };

  return (
    <div
      className={cn(variantStyles[variant], className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * ImageOverlayCard - Lovable Style
 * Image card with gradient overlay and text
 * 
 * Usage:
 * <ImageOverlayCard
 *   image="/path/to/image.jpg"
 *   title="Category Name"
 *   subtitle="Optional subtitle"
 *   gradient="to-t"
 *   overlayOpacity="0.6"
 * />
 */
export function ImageOverlayCard({
  image,
  title,
  subtitle = null,
  badge = null,
  overlayColor = 'from-black/60 via-black/10 to-transparent',
  onClick = null,
  className = '',
  aspectRatio = '3/4',
}) {
  return (
    <Card
      variant="image-overlay"
      className={cn('cursor-pointer w-full', className)}
      onClick={onClick}
      style={{ aspectRatio }}
      role="button"
      tabIndex={0}
    >
      {/* Background Image */}
      {image ? (
        <img
          src={image}
          alt={title}
          loading="lazy"
          width={300}
          height={400}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400">No image</span>
        </div>
      )}

      {/* Gradient Overlay */}
      <div className={cn('absolute inset-0 bg-gradient-to-t', overlayColor)} />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {badge && (
          <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-white/20 text-white mb-2">
            {badge}
          </span>
        )}
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        {subtitle && <p className="text-white/80 text-xs mt-1">{subtitle}</p>}
      </div>
    </Card>
  );
}

/**
 * TestimonialCard - Lovable Style
 * Quote card with testimonial text
 * 
 * Usage:
 * <TestimonialCard
 *   name="John Doe"
 *   text="Great experience!"
 * />
 */
export function TestimonialCard({
  name,
  text,
  avatar = null,
  role = null,
  className = '',
}) {
  return (
    <Card variant="testimonial" className={className}>

      {/* Quote */}
      <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">
        "{text}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        {avatar && (
          <img
            src={avatar}
            alt={name}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div>
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          {role && <p className="text-xs text-gray-500">{role}</p>}
        </div>
      </div>
    </Card>
  );
}

/**
 * StatCard - Lovable Style
 * Statistics display card
 * 
 * Usage:
 * <StatCard
 *   label="Active Salons"
 *   value="10k+"
 * />
 */
export function StatCard({
  label,
  value,
  icon = null,
  color = 'text-[#E62E2E]',
  className = '',
}) {
  return (
    <Card variant="stat" className={className}>
      {icon && <div className={cn('text-2xl mb-2', color)}>{icon}</div>}
      <div className={cn('text-3xl font-bold', color)}>{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </Card>
  );
}
