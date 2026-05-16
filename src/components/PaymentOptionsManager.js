import React, { useState, useEffect, useCallback } from 'react';
import { businessAPI, paymentOptionAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';

const PaymentOptionsManager = ({ businessId, business, onBusinessUpdated }) => {
  const [paymentMode, setPaymentMode] = useState(business?.paymentMode || 'single');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchOptions = useCallback(async () => {
    try {
      const res = await paymentOptionAPI.getAll(businessId);
      setOptions(res.data);
    } catch (err) {
      console.error('[PaymentOptions] Failed to load:', err.message);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  useEffect(() => {
    setPaymentMode(business?.paymentMode || 'single');
  }, [business]);

  const handleModeChange = async (mode) => {
    setPaymentMode(mode);
    try {
      const res = await businessAPI.update(businessId, { ...business, paymentMode: mode });
      if (onBusinessUpdated) onBusinessUpdated(res.data);
      toast.success(`Switched to ${mode} payment mode`);
    } catch (err) {
      toast.error('Failed to update payment mode');
    }
  };

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      { id: `new_${Date.now()}`, batchId: '', paymentLink: '', qrImageUrl: '', isNew: true },
    ]);
  };

  const updateLocal = (index, field, value) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value, isDirty: true } : opt))
    );
  };

  const removeOption = async (index) => {
    const opt = options[index];
    if (!opt.isNew) {
      try {
        await paymentOptionAPI.delete(businessId, opt.id);
        toast.success('Payment option deleted');
      } catch (err) {
        toast.error('Failed to delete');
        return;
      }
    }
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const saveAll = async () => {
    // Validate: each option needs at least link or QR
    for (const opt of options) {
      if (!opt.paymentLink && !opt.qrImageUrl) {
        toast.error('Each option needs at least a Payment Link or QR Image URL');
        return;
      }
      if (paymentMode === 'multiple' && !opt.batchId.trim()) {
        toast.error('Each batch option needs a Batch ID');
        return;
      }
    }

    setSaving(true);
    try {
      for (const opt of options) {
        const data = {
          batchId: paymentMode === 'single' ? '' : opt.batchId.trim(),
          paymentLink: opt.paymentLink.trim(),
          qrImageUrl: opt.qrImageUrl.trim(),
        };

        if (opt.isNew) {
          await paymentOptionAPI.create(businessId, data);
        } else if (opt.isDirty) {
          await paymentOptionAPI.update(businessId, opt.id, data);
        }
      }
      toast.success('Payment options saved!');
      await fetchOptions(); // Refresh from server
    } catch (err) {
      console.error('[PaymentOptions] Save failed:', err.message);
      toast.error('Failed to save payment options');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: '#888', fontSize: '14px' }}>Loading payment options...</p>;

  return (
    <div style={styles.container}>
      <h4 style={styles.sectionTitle}>💳 Payment Configuration</h4>

      {/* Mode Toggle */}
      <div style={styles.modeToggle}>
        <label style={styles.radioLabel}>
          <input
            type="radio"
            name="paymentMode"
            checked={paymentMode === 'single'}
            onChange={() => handleModeChange('single')}
          />
          Single Payment (one link + QR for all)
        </label>
        <label style={styles.radioLabel}>
          <input
            type="radio"
            name="paymentMode"
            checked={paymentMode === 'multiple'}
            onChange={() => handleModeChange('multiple')}
          />
          Multiple Payment (batch-based: Go1, Go2, etc.)
        </label>
      </div>

      {/* Options List */}
      <div style={styles.optionsList}>
        {options.length === 0 && (
          <p style={styles.emptyText}>No payment options configured. Add one below.</p>
        )}

        {options.map((opt, i) => (
          <div key={opt.id} style={styles.optionCard}>
            <div style={styles.optionHeader}>
              <span style={styles.optionNum}>#{i + 1}</span>
              <button onClick={() => removeOption(i)} style={styles.deleteBtn} title="Remove">
                <FiTrash2 />
              </button>
            </div>

            {paymentMode === 'multiple' && (
              <div style={styles.field}>
                <label style={styles.label}>Batch ID</label>
                <input
                  value={opt.batchId}
                  onChange={(e) => updateLocal(i, 'batchId', e.target.value)}
                  placeholder="e.g. Go1, Go2"
                  style={styles.input}
                />
                <span style={styles.hint}>Users whose ID starts with this prefix will see this payment option</span>
              </div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>Payment Link</label>
              <input
                value={opt.paymentLink}
                onChange={(e) => updateLocal(i, 'paymentLink', e.target.value)}
                placeholder="https://pay.example.com/link"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>QR Image URL</label>
              <input
                value={opt.qrImageUrl}
                onChange={(e) => updateLocal(i, 'qrImageUrl', e.target.value)}
                placeholder="https://example.com/qr-code.png"
                style={styles.input}
              />
              {opt.qrImageUrl && (
                <img
                  src={opt.qrImageUrl}
                  alt="QR Preview"
                  style={styles.qrPreview}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        {paymentMode === 'single' && options.length === 0 && (
          <button onClick={addOption} style={styles.addBtn}>
            <FiPlus /> Add Payment Option
          </button>
        )}
        {paymentMode === 'single' && options.length > 0 && null}
        {paymentMode === 'multiple' && (
          <button onClick={addOption} style={styles.addBtn}>
            <FiPlus /> Add Batch Option
          </button>
        )}
        {options.length > 0 && (
          <button onClick={saveAll} style={styles.saveBtn} disabled={saving}>
            <FiSave /> {saving ? 'Saving...' : 'Save Payment Options'}
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    borderTop: '1px solid #eee',
    paddingTop: '16px',
    marginTop: '8px',
  },
  sectionTitle: {
    margin: '0 0 12px',
    fontSize: '14px',
    color: '#1a1a2e',
  },
  modeToggle: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#444',
    cursor: 'pointer',
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyText: {
    color: '#888',
    fontSize: '13px',
    textAlign: 'center',
    padding: '12px',
    background: '#fafafa',
    borderRadius: '8px',
  },
  optionCard: {
    border: '1px solid #e8e8e8',
    borderRadius: '8px',
    padding: '12px',
    background: '#fafbff',
  },
  optionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  optionNum: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#667eea',
  },
  deleteBtn: {
    border: 'none',
    background: '#fee',
    color: '#e74c3c',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#555',
  },
  input: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1.5px solid #ddd',
    fontSize: '13px',
    outline: 'none',
  },
  hint: {
    fontSize: '11px',
    color: '#888',
  },
  qrPreview: {
    maxWidth: '100px',
    marginTop: '4px',
    borderRadius: '6px',
    border: '1px solid #eee',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '12px',
    flexWrap: 'wrap',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 14px',
    border: '1.5px solid #667eea',
    borderRadius: '6px',
    background: 'transparent',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    background: '#27ae60',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
};

export default PaymentOptionsManager;
