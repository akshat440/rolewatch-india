import React from 'react';
import { theme } from '../../theme';

export const Card = ({ children, gradient, hover, onClick, style, className }) => {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: gradient ? theme.gradients[gradient] : 'white',
        borderRadius: theme.borderRadius.xl,
        padding: '24px',
        boxShadow: theme.shadows.md,
        border: gradient ? 'none' : '1px solid ' + theme.colors.gray[200],
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
      onMouseEnter={(e) => {
        if (hover && onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = theme.shadows.xl;
        }
      }}
      onMouseLeave={(e) => {
        if (hover && onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = theme.shadows.md;
        }
      }}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, style }) => (
  <div style={{ marginBottom: '16px', ...style }}>
    {children}
  </div>
);

export const CardTitle = ({ children, style }) => (
  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: theme.colors.dark, ...style }}>
    {children}
  </h3>
);

export const CardDescription = ({ children, style }) => (
  <p style={{ fontSize: '14px', color: theme.colors.gray[600], margin: '8px 0 0 0', ...style }}>
    {children}
  </p>
);
