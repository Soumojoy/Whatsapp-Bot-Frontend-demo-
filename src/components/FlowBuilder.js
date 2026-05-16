import React, { useState } from 'react';
import { flowAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const FlowBuilder = ({ businessId, flows, onFlowCreated, onFlowDeleted }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    optionTitle: '',
    replyType: 'text',
    replyValue: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[FlowBuilder] Creating flow:', form);

    if (!form.optionTitle || !form.replyValue) {
      toast.error('Option title and reply value are required');
      return;
    }

    setLoading(true);
    try {
      const res = await flowAPI.create({
        businessId,
        ...form,
        sortOrder: flows.length,
      });
      console.log('[FlowBuilder] Flow created:', res.data);
      onFlowCreated(res.data);
      setForm({ optionTitle: '', replyType: 'text', replyValue: '' });
      setShowForm(false);
    } catch (err) {
      console.error('[FlowBuilder] Create failed:', err.message);
      toast.error('Failed to create flow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Chat Flow Builder</h3>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          <FiPlus /> Add Option
        </button>
      </div>

      {/* Existing Flows */}
      {flows.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No menu options yet. Add your first chat flow option!</p>
        </div>
      ) : (
        <div style={styles.flowList}>
          {flows.map((flow, index) => (
            <div key={flow.id} style={styles.flowCard}>
              <div style={styles.flowHeader}>
                <span style={styles.flowIndex}>{index + 1}</span>
                <div style={styles.flowInfo}>
                  <h4 style={styles.flowTitle}>{flow.optionTitle}</h4>
                  <span style={styles.flowType}>{flow.replyType.toUpperCase()}</span>
                </div>
                <button
                  onClick={() => onFlowDeleted(flow.id)}
                  style={styles.deleteFlowBtn}
                  title="Delete flow"
                >
                  <FiTrash2 />
                </button>
              </div>
              <div style={styles.flowReply}>
                <span style={styles.replyLabel}>Reply:</span>
                <p style={styles.replyValue}>{flow.replyValue}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Flow Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h4 style={styles.formTitle}>New Menu Option</h4>

          <div style={styles.field}>
            <label style={styles.label}>Option Title</label>
            <input
              value={form.optionTitle}
              onChange={(e) => setForm({ ...form, optionTitle: e.target.value })}
              placeholder="e.g. Cricket"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Reply Type</label>
            <select
              value={form.replyType}
              onChange={(e) => setForm({ ...form, replyType: e.target.value })}
              style={styles.input}
            >
              <option value="text">Text</option>
              <option value="pdf">PDF Link</option>
              <option value="link">Website Link</option>
              <option value="image">Image</option>
              <option value="deposit">💰 Deposit Flow</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Reply Value</label>
            <textarea
              value={form.replyValue}
              onChange={(e) => setForm({ ...form, replyValue: e.target.value })}
              placeholder={
                form.replyType === 'pdf'
                  ? 'https://example.com/file.pdf'
                  : form.replyType === 'link'
                  ? 'https://example.com'
                  : 'Type your reply message...'
              }
              style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
              required
            />
          </div>

          <div style={styles.formActions}>
            <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Adding...' : 'Add Option'}
            </button>
          </div>
        </form>
      )}

      {/* Flow Preview */}
      {flows.length > 0 && (
        <div style={styles.preview}>
          <h4 style={styles.previewTitle}>Bot Preview</h4>
          <div style={styles.chatBubble}>
            <p style={styles.chatText}>Choose an option:</p>
            {flows.map((flow, i) => (
              <p key={flow.id} style={styles.chatOption}>
                {i + 1}. {flow.optionTitle}
              </p>
            ))}
          </div>
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
    border: '1px solid #f0f0f0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '22px',
  },
  title: { margin: 0, fontSize: '17px', fontWeight: '700', color: '#1a1a2e' },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 18px',
    border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '13px',
    boxShadow: '0 3px 12px rgba(102, 126, 234, 0.25)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 20px',
    color: '#999',
    border: '2px dashed #e0e0e0',
    borderRadius: '12px',
    fontSize: '14px',
  },
  flowList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  flowCard: {
    border: '1px solid #f0f0f0',
    borderRadius: '12px',
    padding: '16px 18px',
    background: '#fafbfc',
  },
  flowHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  flowIndex: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
  },
  flowInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  flowTitle: { margin: 0, fontSize: '14px', fontWeight: '600', color: '#1a1a2e' },
  flowType: {
    fontSize: '10px',
    padding: '3px 10px',
    borderRadius: '6px',
    background: '#f0f0ff',
    color: '#667eea',
    fontWeight: '700',
    letterSpacing: '0.3px',
  },
  deleteFlowBtn: {
    border: 'none',
    background: 'transparent',
    color: '#ccc',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
  },
  flowReply: { marginLeft: '42px' },
  replyLabel: { fontSize: '11px', color: '#999', fontWeight: '600', letterSpacing: '0.3px' },
  replyValue: {
    margin: '3px 0 0',
    fontSize: '13px',
    color: '#666',
    wordBreak: 'break-all',
  },
  form: {
    marginTop: '20px',
    border: '1.5px solid #667eea',
    borderRadius: '14px',
    padding: '22px',
    background: '#fafbff',
  },
  formTitle: { margin: '0 0 18px', fontSize: '15px', fontWeight: '700', color: '#1a1a2e' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#444', letterSpacing: '0.2px' },
  input: {
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e0e0e0',
    fontSize: '14px',
    outline: 'none',
    background: '#fff',
  },
  formActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '10px 22px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '10px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: '#666',
  },
  submitBtn: {
    padding: '10px 22px',
    border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '13px',
    boxShadow: '0 3px 12px rgba(102, 126, 234, 0.25)',
  },
  preview: {
    marginTop: '24px',
    padding: '20px',
    background: '#e5ddd5',
    borderRadius: '14px',
  },
  previewTitle: {
    margin: '0 0 12px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#888',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  chatBubble: {
    background: '#dcf8c6',
    borderRadius: '10px',
    padding: '14px',
    maxWidth: '280px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  chatText: { margin: '0 0 6px', fontSize: '14px', color: '#333' },
  chatOption: { margin: '2px 0', fontSize: '14px', color: '#333' },
};

export default FlowBuilder;
