import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return { bg: '#4CAF50', border: '#388E3C' };
      case 'error':
        return { bg: '#F44336', border: '#D32F2F' };
      case 'warning':
        return { bg: '#FF9800', border: '#F57C00' };
      case 'info':
        return { bg: '#2196F3', border: '#1976D2' };
    }
  };

  const colors = getColors();

  return (
    <div
      style={{
        ...styles.toast,
        backgroundColor: colors.bg,
        borderLeft: `4px solid ${colors.border}`,
      }}
    >
      <div style={styles.toastIcon}>{getIcon()}</div>
      <div style={styles.toastContent}>
        <div style={styles.toastTitle}>{toast.title}</div>
        {toast.message && (
          <div style={styles.toastMessage}>{toast.message}</div>
        )}
      </div>
      <button
        style={styles.toastClose}
        onClick={() => onDismiss(toast.id)}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div style={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed' as const,
    top: '80px',
    right: '32px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    maxWidth: '420px',
  },
  toast: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    color: '#FFFFFF',
    animation: 'slideIn 0.3s ease-out',
    cursor: 'pointer',
  },
  toastIcon: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    flexShrink: 0,
  },
  toastContent: {
    flex: 1,
    minWidth: 0,
  },
  toastTitle: {
    fontSize: '14px',
    fontWeight: '600' as const,
    marginBottom: '4px',
  },
  toastMessage: {
    fontSize: '13px',
    opacity: 0.95,
    wordBreak: 'break-word' as const,
    whiteSpace: 'pre-wrap' as const,
    fontFamily: 'monospace',
  },
  toastClose: {
    background: 'none',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    opacity: 0.8,
  },
};
