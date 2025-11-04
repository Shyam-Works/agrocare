// components/Card.jsx
import React from 'react';

const Card = ({
  children,
  className = '',
  variant = 'default', // default, glassmorphism, solid
  padding = 'md', // sm, md, lg, xl
  rounded = 'lg', // sm, md, lg, xl, full
  shadow = 'md', // none, sm, md, lg, xl
  ...props
}) => {
  const baseClasses = 'relative';
  
  const variants = {
    default: 'bg-white border border-gray-200',
    glassmorphism: 'bg-white/5 backdrop-blur-[6px] border border-white/10',
    solid: 'bg-gray-50 border border-gray-100'
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const roundings = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full'
  };

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl'
  };

  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${paddings[padding]}
    ${roundings[rounded]}
    ${shadows[shadow]}
    ${className}
  `.trim();

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;