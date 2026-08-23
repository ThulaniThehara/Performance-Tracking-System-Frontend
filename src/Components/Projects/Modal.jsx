import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";

/**
 * Reusable dialog for every create/edit flow in the module.
 * Closes on backdrop click and on Escape; the body scroll is locked while open
 * so the page behind does not drift.
 */
const Modal = ({ open, title, onClose, children, footer, width = 480 }) => {
  const { t } = useTranslation();
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="pm-modal-backdrop" onClick={onClose}>
      <div
        className="pm-modal"
        style={{ maxWidth: width }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pm-modal-head">
          <h3>{title}</h3>
          <button className="pm-icon-btn" onClick={onClose} aria-label={t('projects.details.aria.close')}>
            <FaTimes />
          </button>
        </div>

        <div className="pm-modal-body">{children}</div>

        {footer && <div className="pm-modal-foot">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
