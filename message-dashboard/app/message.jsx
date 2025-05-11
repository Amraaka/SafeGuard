import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3000/api/messages');
      
      if (!response.ok) {
        throw new Error(`Алдаа: ${response.status}`);
      }
      
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Мессеж татахад алдаа гарлаа:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Мессежүүдийн жагсаалт</h1>
      
      <button className={styles.refreshButton} onClick={fetchMessages}>
        Шинэчлэх
      </button>
      
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
                  <tr key={message._id} className={styles.messageRow}>
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