import React from 'react';

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = 'var(--border-radius-sm)', style, className = '' }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: '180px' }}>
      <Skeleton width="40%" height="24px" />
      <Skeleton width="90%" height="16px" />
      <Skeleton width="75%" height="16px" />
      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
        <Skeleton width="100px" height="35px" borderRadius="var(--border-radius-md)" />
        <Skeleton width="80px" height="35px" borderRadius="var(--border-radius-md)" />
      </div>
    </div>
  );
};

export default Skeleton;
