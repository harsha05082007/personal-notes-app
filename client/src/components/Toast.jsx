import React, { useEffect } from 'react';
import { IconCheck, IconAlert } from './Icons';

export const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="toast-container">
      <div className={`toast-card toast-${type} animate-scale-up`}>
        <div className="toast-icon">
          {isSuccess ? <IconCheck size={18} /> : <IconAlert size={18} />}
        </div>
        <div className="toast-message">{message}</div>
        <button onClick={onClose} className="toast-close-btn" aria-label="Close notification">
          &times;
        </button>
      </div>
    </div>
  );
};
