import React from 'react';

const Loader = ({ size = 'md', variant = 'primary', className = '' }) => {
  const sizes = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const variants = {
    primary: 'border-primary-500 border-t-transparent dark:border-primary-400 dark:border-t-transparent',
    white: 'border-white border-t-transparent',
    dark: 'border-slate-800 border-t-transparent dark:border-slate-200 dark:border-t-transparent',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`rounded-full animate-spin ${sizes[size]} ${variants[variant]}`}
        style={{ borderTopColor: 'transparent' }}
        role="status"
        aria-label="loading"
      />
    </div>
  );
};

export default Loader;
