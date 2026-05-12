import React, { useState } from 'react';
import { businessAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';

const CreateBusinessModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    businessName: '',
    botName: 'Professor',
    greetingMessage: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[CreateBusiness] Submitting:', form);

    if (!form.businessName) {
      toast.error('Business name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await businessAPI.create({
        ...form,
        greetingMessage: form.greetingMessage || `Hi 👋\nI am ${form.botName} from ${form.businessName}.`,
      });
      console.log('[CreateBusiness] Created:', res.data);
      onCreated(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create business';
      console.error('[CreateBusiness] Failed:', msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Create New Business</h2>
          <button onClick={onClose} style={styles.closeBtn}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Business Name *</label>
            <input
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              placeholder="e.g. Offset Sports"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Bot Name</label>
            <input
              value={form.botName}
              onChange={(e) => setForm({ ...form, botName: e.target.value })}
              placeholder="e.g. Professor"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Greeting Message</label>
            <textarea
              value={form.greetingMessage}
              onChange={(e) => setForm({ ...form, greetingMessage: e.target.value })}
              placeholder="Leave blank for default greeting"
              style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Creating...' : 'Create Business'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '460px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  modalTitle: { margin: 0, fontSize: '20px', color: '#1a1a2e' },
  closeBtn: {
    border: 'none',
    background: 'transparent',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#888',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#555' },
  input: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1.5px solid #ddd',
    fontSize: '14px',
    outline: 'none',
  },
  submitBtn: {
    padding: '14px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
};

export default CreateBusinessModal;
