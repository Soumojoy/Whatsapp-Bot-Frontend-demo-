import React from 'react';
import { FiCopy, FiSettings, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const BotPreviewCard = ({ business, onManage, onDelete }) => {
  const phoneNumber = business.virtualNumber.replace(/[^0-9]/g, '');
  const joinLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent('join means-rapidly')}`;
  const botLink = `https://wa.me/${phoneNumber}?text=start_${business.businessSlug}`;

  const copyJoinLink = () => {
    navigator.clipboard.writeText(joinLink);
    toast.success('Join link copied!');
  };

  const copyBotLink = () => {
    navigator.clipboard.writeText(botLink);
    toast.success('Bot link copied!');
    console.log('[BotPreview] Link copied:', botLink);
  };

  return (
    <div style={styles.card}>
      {/* Bot Identity */}
      <div style={styles.identity}>
        <div style={styles.avatar}>🤖</div>
        <div>
          <h3 style={styles.botName}>{business.botName} | {business.businessName}</h3>
          <p style={styles.number}>{business.virtualNumber}</p>
        </div>
      </div>

      {/* Join Link (for new users) */}
      <div style={styles.linkBox}>
        <p style={styles.linkLabel}>📲 Step 1 — Join Link (new users only):</p>
        <div style={styles.linkRow}>
          <code style={styles.linkText}>{joinLink}</code>
          <button onClick={copyJoinLink} style={styles.copyBtnGreen} title="Copy join link">
            <FiCopy />
          </button>
        </div>
      </div>

      {/* Bot Link */}
      <div style={styles.linkBox}>
        <p style={styles.linkLabel}>🤖 Step 2 — Bot Link (start chat):</p>
        <div style={styles.linkRow}>
          <code style={styles.linkText}>{botLink}</code>
          <button onClick={copyBotLink} style={styles.copyBtn} title="Copy bot link">
            <FiCopy />
          </button>
        </div>
      </div>

      {/* Flow preview */}
      {business.flows && business.flows.length > 0 && (
        <div style={styles.flowPreview}>
          <p style={styles.flowLabel}>Menu Options:</p>
          {business.flows.map((flow, i) => (
            <p key={flow.id} style={styles.flowItem}>
              {i + 1}. {flow.optionTitle}
            </p>
          ))}
        </div>
      )}

      {/* Actions */}
      {(onManage || onDelete) && (
        <div style={styles.actions}>
          {onManage && (
            <button onClick={onManage} style={styles.manageBtn}>
              <FiSettings /> Manage
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} style={styles.deleteBtn}>
              <FiTrash2 /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e8e8e8',
  },
  identity: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  avatar: {
    fontSize: '36px',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f0ff',
    borderRadius: '12px',
  },
  botName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  number: {
    margin: '2px 0 0',
    fontSize: '13px',
    color: '#888',
  },
  linkBox: {
    background: '#f8f9ff',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
  },
  linkLabel: {
    margin: '0 0 6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
  },
  linkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  linkText: {
    flex: 1,
    fontSize: '12px',
    color: '#667eea',
    wordBreak: 'break-all',
    background: 'transparent',
  },
  copyBtn: {
    border: 'none',
    background: '#667eea',
    color: '#fff',
    borderRadius: '6px',
    padding: '6px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  copyBtnGreen: {
    border: 'none',
    background: '#25D366',
    color: '#fff',
    borderRadius: '6px',
    padding: '6px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  flowPreview: { marginBottom: '16px' },
  flowLabel: {
    margin: '0 0 4px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
  },
  flowItem: {
    margin: '2px 0',
    fontSize: '14px',
    color: '#333',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    borderTop: '1px solid #eee',
    paddingTop: '16px',
  },
  manageBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    background: '#667eea',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
  },
  deleteBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 16px',
    border: '1.5px solid #e74c3c',
    borderRadius: '8px',
    background: 'transparent',
    color: '#e74c3c',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
  },
};

export default BotPreviewCard;
