import React, { useState, useEffect, useCallback } from 'react';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiMessageSquare, FiChevronDown, FiChevronRight } from 'react-icons/fi';

const ChatHistory = ({ businessId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNumber, setExpandedNumber] = useState(null);

  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await chatAPI.getByBusiness(businessId);
      setChats(res.data);
    } catch (err) {
      console.error('[ChatHistory] Failed:', err.message);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Group chats by customerNumber (WhatsApp number)
  const grouped = {};
  chats.forEach((chat) => {
    const num = chat.customerNumber;
    if (!grouped[num]) {
      grouped[num] = [];
    }
    grouped[num].push(chat);
  });

  // Sort groups by latest message timestamp (most recent first)
  const sortedNumbers = Object.keys(grouped).sort((a, b) => {
    const latestA = new Date(grouped[a][0].timestamp);
    const latestB = new Date(grouped[b][0].timestamp);
    return latestB - latestA;
  });

  const formatNumber = (num) => {
    // "whatsapp:+919876543210" → "+919876543210"
    return num.replace('whatsapp:', '');
  };

  const toggleExpand = (num) => {
    setExpandedNumber(expandedNumber === num ? null : num);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}><FiMessageSquare /> Chat History</h3>
        <button onClick={fetchChats} style={styles.refreshBtn} title="Refresh">
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {loading && chats.length === 0 ? (
        <p style={styles.loadingText}>Loading chats...</p>
      ) : sortedNumbers.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No chat history yet. Conversations will appear here when users interact with the bot.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {sortedNumbers.map((num) => {
            const userChats = grouped[num];
            const isExpanded = expandedNumber === num;
            const lastChat = userChats[0];

            return (
              <div key={num} style={styles.userGroup}>
                {/* User row — clickable */}
                <div style={styles.userRow} onClick={() => toggleExpand(num)}>
                  <div style={styles.userInfo}>
                    <span style={styles.expandIcon}>
                      {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                    </span>
                    <span style={styles.userAvatar}>👤</span>
                    <div>
                      <p style={styles.userNumber}>{formatNumber(num)}</p>
                      <p style={styles.userMeta}>
                        {userChats.length} message{userChats.length !== 1 ? 's' : ''} · Last: {new Date(lastChat.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expanded — show conversation thread */}
                {isExpanded && (
                  <div style={styles.thread}>
                    {[...userChats].reverse().map((chat) => (
                      <div key={chat.id} style={styles.chatPair}>
                        {/* User message */}
                        <div style={styles.msgRow}>
                          <div style={styles.userBubble}>
                            <p style={styles.msgText}>{chat.message}</p>
                            <span style={styles.msgTime}>{new Date(chat.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        {/* Bot response */}
                        <div style={{ ...styles.msgRow, justifyContent: 'flex-start' }}>
                          <div style={styles.botBubble}>
                            <p style={styles.msgText}>{chat.response}</p>
                            <span style={styles.msgTime}>{new Date(chat.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    marginTop: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    color: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 14px',
    border: '1.5px solid #ddd',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#555',
  },
  loadingText: { textAlign: 'center', color: '#888', fontSize: '14px' },
  emptyState: {
    padding: '24px',
    textAlign: 'center',
    color: '#888',
    fontSize: '14px',
    background: '#fafafa',
    borderRadius: '8px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  userGroup: {
    border: '1px solid #eee',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    cursor: 'pointer',
    background: '#fafbff',
    transition: 'background 0.15s',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  expandIcon: {
    color: '#667eea',
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px',
  },
  userAvatar: { fontSize: '20px' },
  userNumber: {
    margin: 0,
    fontWeight: '600',
    fontSize: '14px',
    color: '#1a1a2e',
  },
  userMeta: {
    margin: '2px 0 0',
    fontSize: '12px',
    color: '#888',
  },
  thread: {
    padding: '12px 16px',
    background: '#f0f2f5',
    maxHeight: '400px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  chatPair: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  msgRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  userBubble: {
    background: '#dcf8c6',
    borderRadius: '8px 8px 0 8px',
    padding: '8px 12px',
    maxWidth: '75%',
    wordBreak: 'break-word',
  },
  botBubble: {
    background: '#fff',
    borderRadius: '8px 8px 8px 0',
    padding: '8px 12px',
    maxWidth: '75%',
    wordBreak: 'break-word',
    border: '1px solid #e8e8e8',
  },
  msgText: {
    margin: 0,
    fontSize: '13px',
    color: '#333',
    whiteSpace: 'pre-wrap',
  },
  msgTime: {
    display: 'block',
    fontSize: '10px',
    color: '#999',
    textAlign: 'right',
    marginTop: '4px',
  },
};

export default ChatHistory;
