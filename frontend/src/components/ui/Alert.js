import React from 'react';
import { theme } from '../../theme';
import Icon from '../common/Icon';

export const Alert = ({ children, variant = 'info', title, icon, onClose, style }) => {
  const variants = {
    success: {
      background: theme.colors.success + '10',
      border: theme.colors.success,
      color: '#065f46',
      icon: 'user'
    },
    warning: {
      background: theme.colors.warning + '10',
      border: theme.colors.warning,
      color: '#92400e',
      icon: 'alert'
    },
    danger: {
      background: theme.colors.danger + '10',
      border: theme.colors.danger,
      color: '#991b1b',
      icon: 'alert'
    },
    info: {
      background: theme.colors.info + '10',
      border: theme.colors.info,
      color: '#1e40af',
      icon: 'dashboard'
    }
  };

  const config = variants[variant];

  return (
    <div style={{
      background: config.background,
      border: `2px solid ${config.border}`,
      borderRadius: theme.borderRadius.lg,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      ...style
    }}>
      <Icon name={icon || config.icon} size={20} style={{ color: config.border, flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px', color: config.color }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: '14px', color: config.color, lineHeight: '1.6' }}>
          {children}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: config.color,
            fontSize: '18px',
            lineHeight: 1
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};
