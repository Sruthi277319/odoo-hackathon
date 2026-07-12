import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  onClick,
  animate = true,
  ...props
}) => {
  const CardContainer = onClick ? motion.div : 'div';
  const animationProps = animate && onClick
    ? {
        whileHover: { y: -4, scale: 1.01 },
        whileTap: { scale: 0.99 },
      }
    : {};

  return (
    <CardContainer
      {...animationProps}
      className={`glass-card ${onClick ? 'cursor-pointer glass-card-hover' : ''} p-5 ${className}`}
      onClick={onClick}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800/40 pb-3.5 mb-4">
          <div>
            {title && <h3 className="font-semibold text-base text-slate-800 dark:text-slate-200">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className="text-sm text-slate-600 dark:text-slate-300">
        {children}
      </div>
    </CardContainer>
  );
};

export default Card;
