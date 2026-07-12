import React from 'react';

export const Button = ({ children, variant = 'primary', onClick, type = 'button', disabled = false, style, className = '' }) => {
  const getBtnClass = () => {
    switch (variant) {
      case 'secondary':
        return 'btn-secondary';
      case 'danger':
        return 'btn-danger';
      case 'primary':
      default:
        return 'btn-primary';
    }
  };

  return (
    <button
      type={type}
      className={`btn ${getBtnClass()} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        ...style,
      }}
    >
      {children}
    </button>
  );
};
export default Button;
