// components/Button.jsx
import React from 'react';

const Button = ({
  children,
  type = 'button',
  onClick,
  disabled = false,
  variant = 'primary', // primary, secondary, google, outline
  size = 'md', // sm, md, lg
  fullWidth = false,
  className = '',
  loading = false,
  loadingText = 'Loading...',
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#C5D96F] border border-[#99d98c] text-black hover:bg-[#A1B84C] focus:ring-green-400 hover:scale-105 hover:shadow-lg disabled:bg-gray-400',
    secondary: 'bg-white/10 border border-white/30 text-white hover:bg-white/20 focus:ring-white/50 backdrop-blur-sm disabled:opacity-50',
    google: 'bg-white/10 border border-white/30 text-white hover:bg-white/20 focus:ring-white/50 backdrop-blur-sm disabled:opacity-50',
    outline: 'border border-white/70 text-white hover:bg-white/10 focus:ring-white/50 disabled:opacity-50',
    upload: 'bg-white text-black hover:bg-green-200 border border-green-200 focus:ring-green-400 disabled:bg-gray-300 disabled:text-gray-500'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${widthClass}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
};

export default Button;