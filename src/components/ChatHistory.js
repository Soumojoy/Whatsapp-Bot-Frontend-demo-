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
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
    marginTop: '24px',
    border: '1px solid #f0f0f0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    fontSize: '17px',
    fontWeight: '700',
    color: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '10px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: '#666',
  },
  loadingText: { textAlign: 'center', color: '#999', fontSize: '14px', padding: '40px 0' },
  emptyState: {
    padding: '32px',
    textAlign: 'center',
    color: '#999',
    fontSize: '14px',
    background: '#fafbfc',
    borderRadius: '12px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  userGroup: {
    border: '1px solid #f0f0f0',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    cursor: 'pointer',
    background: '#fafbfc',
    transition: 'background 0.15s',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
    margin: '3px 0 0',
    fontSize: '12px',
    color: '#999',
  },
  thread: {
    padding: '16px 18px',
    background: '#f0f2f5',
    maxHeight: '400px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  chatPair: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  msgRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  userBubble: {
    background: '#dcf8c6',
    borderRadius: '10px 10px 2px 10px',
    padding: '10px 14px',
    maxWidth: '75%',
    wordBreak: 'break-word',
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  },
  botBubble: {
    background: '#fff',
    borderRadius: '10px 10px 10px 2px',
    padding: '10px 14px',
    maxWidth: '75%',
    wordBreak: 'break-word',
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  },
  msgText: {
    margin: 0,
    fontSize: '13px',
    color: '#333',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.45',
  },
  msgTime: {
    display: 'block',
    fontSize: '10px',
    color: '#aaa',
    textAlign: 'right',
    marginTop: '4px',
  },
};

export default ChatHistory;
