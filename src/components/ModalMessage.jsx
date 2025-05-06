import React from 'react';
import './ModalMessage.css';

const ModalMessage = ({ message, onConfirm, onCancel, confirmText = "Aceptar", cancelText = null }) => {
    return (
        <div className="modal-message">
            <div className="modal-message-content">
                <p>{message}</p>
                <div className="modal-message-buttons">
                    <button onClick={onConfirm}>{confirmText}</button>
                    {cancelText && (
                        <button onClick={onCancel}>{cancelText}</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalMessage;