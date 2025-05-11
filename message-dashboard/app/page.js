'use client';
import { useState, useEffect } from 'react';
import styles from './home.module.css';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');
  
  // You might need to adjust this URL based on your deployment
  // Try using the full URL including protocol
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
      <h1 className={styles.title}>Мессежүүдийн жагсаалт</h1>
      
      {/* Server status indicator */}
      <div className={styles.serverStatus}>
        Сервер статус: {' '}
        <span className={`${styles.statusIndicator} ${styles[serverStatus]}`}>
          {serverStatus === 'checking' && 'Шалгаж байна...'}
          {serverStatus === 'online' && 'Онлайн'}
          {serverStatus === 'offline' && 'Офлайн - серверийг асаана уу'}
          {serverStatus === 'error' && 'Алдаатай холболт'}
        </span>
        <button 
          className={styles.statusCheckButton} 
          onClick={checkServerStatus}
          disabled={serverStatus === 'checking'}
        >
          Статус шалгах
        </button>
      </div>
      
      <div className={styles.controls}>
        <button 
          className={styles.refreshButton} 
          onClick={fetchMessages}
          disabled={loading || serverStatus === 'offline'}
        >
          Шинэчлэх
        </button>
      </div>
      
      {loading && <p className={styles.loading}>Ачааллаж байна...</p>}
      {error && <p className={styles.error}>Алдаа: {error}</p>}
      
      {!loading && !error && (
        <div className={styles.messageList}>
          {messages.length === 0 ? (
            <p>Мессеж олдсонгүй</p>
          ) : (
            <table className={styles.messageTable}>
              <thead>
                <tr>
                  <th>Илгээгч</th>
                  <th>Текст</th>
                  <th>Огноо</th>
                </tr>
              </thead>
              <tbody>
                {messages.map(message => (
                  <tr key={message._id || message.messageSid} className={styles.messageRow}>
                    <td className={styles.sender}>{message.from}</td>
                    <td className={styles.messageBody}>{message.body}</td>
                    <td className={styles.date}>
                      {new Date(message.createdAt).toLocaleString('mn-MN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}