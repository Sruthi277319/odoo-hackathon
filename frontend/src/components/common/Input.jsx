import React from 'react';

const Input = React.forwardRef(({
  label,
  name,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  placeholder = '',
  required = false,
  ...props
}, ref) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          className={`w-full py-2.5 px-3 rounded-lg text-sm transition-all glass-input ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-red-500/80 focus:border-red-500/80 focus:ring-red-500/20'
              : 'border-slate-200 dark:border-slate-800'
          }`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium">
          {error.message || error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
