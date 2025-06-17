import React, { useEffect } from 'react';
import '../../styles/Alert.css';

const Alert = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  if (!message) {
    return null;
  }

  return (
    <div className={`alert-container alert-${type}`}>
      <div className="alert-message">{message}</div>
      <button onClick={onClose} className="alert-close-btn">
        &times;
      </button>
    </div>
  );
};

export default Alert;
