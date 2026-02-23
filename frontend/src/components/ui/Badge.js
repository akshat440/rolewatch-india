import React from 'react';
import { theme } from '../../theme';

export const Badge = ({ children, variant = 'default', size = 'md', style }) => {
  const variants = {
    default: { background: theme.colors.gray[100], color: theme.colors.gray[700] },
    primary: { background: theme.colors.primary + '20', color: theme.colors.primary },
    success: { background: theme.colors.success + '20', color: theme.colors.success },
    warning: { background: theme.colors.warning + '20', color: theme.colors.warning },
    danger: { background: theme.colors.danger + '20', color: theme.colors.danger },
    info: { background: theme.colors.info + '20', color: theme.colors.info }
  };

  const sizes = {
    sm: { padding: '4px 8px', fontSize: '11px' },
    md: { padding: '6px 12px', fontSize: '12px' },
    lg: { padding: '8px 16px', fontSize: '14px' }
  };

  return (
    <span style={{
      ...variants[variant],
      ...sizes[size],
      borderRadius: theme.borderRadius.full,
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      ...style
    }}>
      {children}
    </span>
  );
};
