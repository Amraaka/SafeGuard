'use client';
import { useState, useEffect } from 'react';
import styles from './home.module.css';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  
  // You might need to adjust this URL based on your deployment
  const API_URL = 'http://localhost:5000'; 

  // Check if the server is running when component mounts
  useEffect(() => {
    checkServerStatus();
    fetchMessages();
  }, []);

  // Function to check if the server is running
  const checkServerStatus = async () => {
    try {
      setServerStatus('checking');
      // Try to fetch the root endpoint which should be simpler and faster
      const response = await fetch(`${API_URL}`, { 
        // Add timeout to avoid long waits
        signal: AbortSignal.timeout(5000)
      });
      setServerStatus(response.ok ? 'online' : 'error');
    } catch (err) {
      console.error('Server status check failed:', err);
      setServerStatus('offline');
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (message) => {
    setMessageToDelete(message);
    setIsDeleteModalOpen(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    // Clear the message to delete after a short delay (for animation)
    setTimeout(() => setMessageToDelete(null), 200);
  };

  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    
    try {
      const response = await fetch(`${API_URL}/api/messages/${messageToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Алдаа: ${response.status}`);
      }

      const result = await response.json();
      console.log('Deleted:', result);

      // Close modal
      closeDeleteModal();
      
      // Refresh messages after delete
      fetchMessages();
    } catch (err) {
      console.error('Устгахад алдаа гарлаа:', err);
      alert('Мессеж устгаж чадсангүй');
      closeDeleteModal();
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to the fetch request to avoid long waits
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_URL}/api/messages/all`, {
        signal: controller.signal,
        // Add these headers to help with CORS issues
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Алдаа: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle the structure returned by your backend
      const messagesList = data.success ? data.messages : data;
      setMessages(Array.isArray(messagesList) ? messagesList : []);
    } catch (err) {
      console.error('Мессеж татахад алдаа гарлаа:', err);
      setError(err.message || 'Network error - check if server is running');
    } finally {
      setLoading(false);
    }
  };

  // Function to send a new message
  const sendMessage = async (phoneNumber, messageText) => {
    try {
      const response = await fetch(`${API_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          body: messageText
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Алдаа: ${response.status}`);
      }
      
      // Refresh messages after sending
      fetchMessages();
      return await response.json();
    } catch (err) {
      console.error('Мессеж илгээхэд алдаа гарлаа:', err);
      throw err;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Мессежүүдийн жагсаалт</h1>
        
        {/* Server status indicator */}
        <div className={styles.serverStatus}>
          <div className={styles.statusLabel}>Сервер статус:</div>
          <div className={`${styles.statusBadge} ${styles[serverStatus]}`}>
            {serverStatus === 'checking' && 'Шалгаж байна...'}
            {serverStatus === 'online' && 'Онлайн'}
            {serverStatus === 'offline' && 'Офлайн - серверийг асаана уу'}
            {serverStatus === 'error' && 'Алдаатай холболт'}
          </div>
        </div>
      </div>
      
      <div className={styles.controlPanel}>
        <button 
          className={`${styles.button} ${styles.checkButton}`}
          onClick={checkServerStatus}
          disabled={serverStatus === 'checking'}
        >
          <svg className={styles.buttonIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Статус шалгах
        </button>
        
        <button 
          className={`${styles.button} ${styles.refreshButton}`}
          onClick={fetchMessages}
          disabled={loading || serverStatus === 'offline'}
        >
          <svg className={styles.buttonIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          Шинэчлэх
        </button>
      </div>
      
      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Ачааллаж байна...</p>
        </div>
      )}
      
      {error && <div className={styles.errorAlert}>
        <svg className={styles.errorIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p>Алдаа: {error}</p>
      </div>}
      
      {!loading && !error && (
        <div className={styles.messageListContainer}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <svg className={styles.emptyIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 5-10-5" />
              </svg>
              <p>Мессеж олдсонгүй</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.messageTable}>
                <thead>
                  <tr>
                    <th>Илгээгч</th>
                    <th>Хүлээн авагч</th>
                    <th>Тайлбар</th>
                    <th>Огноо</th>
                    <th>Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map(message => (
                    <tr key={message._id || message.messageSid} className={styles.messageRow}>
                      <td className={styles.sender}>{message.from}</td>
                      <td className={styles.recipient}>{message.to}</td>
                      <td className={styles.messageBody}>{message.body}</td>
                      <td className={styles.date}>
                        {new Date(message.createdAt).toLocaleString('mn-MN')}
                      </td>
                      <td>
                        <button 
                          className={styles.deleteButton} 
                          onClick={() => openDeleteModal(message)}
                          aria-label="Устгах"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {/* <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        messageData={messageToDelete}
      /> */}
    </div>
  );
}