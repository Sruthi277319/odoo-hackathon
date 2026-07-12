import React from 'react';

export const Card = ({ children, title, subtitle, action, style, className = '' }) => {
  return (
    <div className={`glass-card ${className}`} style={{ ...style, display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(title || action || subtitle) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            {title && <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ flexGrow: 1 }}>{children}</div>
    </div>
  );
};
export default Card;
