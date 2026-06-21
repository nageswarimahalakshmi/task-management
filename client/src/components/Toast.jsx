import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

const ToastItem = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000); // Auto close after 4 seconds

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="toast-icon" size={18} style={{ color: 'var(--success)' }} />;
      case 'danger':
        return <XCircle className="toast-icon" size={18} style={{ color: 'var(--danger)' }} />;
      case 'warning':
        return <AlertTriangle className="toast-icon" size={18} style={{ color: 'var(--warning)' }} />;
      default:
        return null;
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      {getIcon()}
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={() => onClose(id)}>
        <X size={16} />
      </button>
    </div>
  );
};

const Toast = ({ toasts, onClose }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export default Toast;
