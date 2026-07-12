import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm border border-transparent dark:bg-primary-500 dark:hover:bg-primary-600',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 dark:bg-dark-800 dark:text-slate-200 dark:hover:bg-dark-900',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-dark-900 bg-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm border border-transparent dark:bg-red-500 dark:hover:bg-red-600',
    ghost: 'text-slate-600 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-400 dark:hover:bg-dark-900 bg-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-2" />
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
