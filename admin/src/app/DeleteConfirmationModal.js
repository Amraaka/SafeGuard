'use client';
import { useEffect, useRef } from 'react';
import styles from './DeleteConfirmationModal.module.css';

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, messageData }) {
  const modalRef = useRef(null);
  
  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  // Handle ESC key press
  useEffect(() => {
    function handleEscKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer} ref={modalRef}>
        <div className={styles.modalHeader}>
          <div className={styles.warningIconContainer}>
            <svg className={styles.warningIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className={styles.modalTitle}>Мессежийг устгах</h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="Хаах">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        
        <div className={styles.modalContent}>
          <p className={styles.confirmationText}>
            Та дараах мессежийг устгахдаа итгэлтэй байна уу?
          </p>
          
          {messageData && (
            <div className={styles.messagePreview}>
              <div className={styles.previewRow}>
                <span className={styles.previewLabel}>Хүлээн авагч:</span>
                <span className={styles.previewValue}>{messageData.to}</span>
              </div>
              <div className={styles.previewRow}>
                <span className={styles.previewLabel}>Огноо:</span>
                <span className={styles.previewValue}>
                  {new Date(messageData.createdAt).toLocaleString('mn-MN')}
                </span>
              </div>
              <div className={styles.previewRow}>
                <span className={styles.previewLabel}>Тайлбар:</span>
                <p className={styles.messageBody}>{messageData.body}</p>
              </div>
            </div>
          )}
          
          <p className={styles.warningText}>
            Анхааруулга: Энэ үйлдлийг буцаах боломжгүй.
          </p>
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            className={`${styles.button} ${styles.cancelButton}`} 
            onClick={onClose}
          >
            Цуцлах
          </button>
          <button 
            className={`${styles.button} ${styles.confirmButton}`} 
            onClick={onConfirm}
          >
            Устгах
          </button>
        </div>
      </div>
    </div>
  );
}