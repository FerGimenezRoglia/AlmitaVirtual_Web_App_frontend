import React, { useEffect, useCallback } from 'react';
import './ModalBase.css';

const ModalBase = ({ message, onConfirm, onCancel, confirmText = "Aceptar", cancelText = "Cancelar" }) => {
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      onConfirm();
    }
  }, [onConfirm]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="modal-base-overlay">
      <div className="modal-base-content">
        <p>{message}</p>
        <div className={`modal-base-buttons ${onCancel ? 'two-buttons' : 'single-button'}`}>
          <button className="confirm-button" onClick={onConfirm}>
            {confirmText}
          </button>
          {onCancel && (
            <button className="cancel-button" onClick={onCancel}>
              {cancelText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalBase;