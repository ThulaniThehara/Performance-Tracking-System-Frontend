import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import '../../SCSS/componentStyle/ConfirmDialog.scss';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", cancelText = "Cancel" }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-dialog-overlay" onClick={onCancel}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onCancel}>
                    <FaTimes />
                </button>
                
                <div className="confirm-dialog-icon">
                    <FaExclamationTriangle />
                </div>
                
                <h2 className="confirm-dialog-title">{title}</h2>
                <p className="confirm-dialog-message">{message}</p>
                
                <div className="confirm-dialog-actions">
                    <button className="btn-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className="btn-confirm" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;