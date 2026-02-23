import React from 'react';
import { theme } from '../../theme';
import Icon from '../common/Icon';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  iconPosition = 'left',
  fullWidth,
  disabled,
  loading,
  onClick,
  style,
  type = 'button'
}) => {
  const variants = {
    primary: {
      background: theme.gradients.primary,
      color: 'white',
      border: 'none'
    },
    success: {
      background: theme.colors.success,
      color: 'white',
      border: 'none'
    },
    danger: {
      background: theme.colors.danger,
      color: 'white',
      border: 'none'
    },
    outline: {
      background: 'transparent',
      color: theme.colors.primary,
      border: '2px solid ' + theme.colors.primary
    },
    ghost: {
      background: theme.colors.gray[100],
      color: theme.colors.gray[700],
      border: 'none'
    }
  };

  const sizes = {
    sm: { padding: '8px 16px', fontSize: '13px' },
    md: { padding: '12px 24px', fontSize: '15px' },
    lg: { padding: '16px 32px', fontSize: '16px' }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...variants[variant],
        ...sizes[size],
        borderRadius: theme.borderRadius.lg,
        fontWeight: '600',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: fullWidth ? '100%' : 'auto',
        boxShadow: theme.shadows.sm,
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = theme.shadows.lg;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = theme.shadows.sm;
        }
      }}
    >
      {loading ? (
        <div className="spinner" style={{ 
          width: '16px', 
          height: '16px', 
          border: '2px solid rgba(255,255,255,0.3)',
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite'
        }} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <Icon name={icon} size={18} />}
          {children}
          {icon && iconPosition === 'right' && <Icon name={icon} size={18} />}
        </>
      )}
    </button>
  );
};
