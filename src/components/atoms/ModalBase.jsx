
import React from 'react';
import './ModalBase.css';

const ModalBase = ({ message, onConfirm, onCancel, confirmText = "Aceptar", cancelText = "Cancelar" }) => {
  return (
    <div className="modal-base-overlay">
      <div className="modal-base-content">
        <p>{message}</p>
        <div className="modal-base-buttons">
          <button className="confirm-button" onClick={onConfirm}>{confirmText}</button>
          <button className="cancel-button" onClick={onCancel}>{cancelText}</button>
        </div>
      </div>
    </div>
  );
};

export default ModalBase;