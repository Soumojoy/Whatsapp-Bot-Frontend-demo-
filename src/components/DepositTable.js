import React, { useState, useEffect, useCallback } from 'react';
import { depositAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';

const DepositTable = ({ businessId }) => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeposits = useCallback(async () => {
    console.log('[DepositTable] Fetching deposits for business:', businessId);
    setLoading(true);
    try {
      const res = await depositAPI.getByBusiness(businessId);
      setDeposits(res.data);
      console.log('[DepositTable] Loaded', res.data.length, 'deposits');
    } catch (err) {
      console.error('[DepositTable] Failed:', err.message);
      toast.error('Failed to load deposits');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(fetchDeposits, 15000);
    return () => clearInterval(interval);
  }, [fetchDeposits]);

  const handleStatusUpdate = async (depositId, status) => {
    console.log('[DepositTable] Updating status:', depositId, '→', status);
    try {
      const res = await depositAPI.updateStatus(depositId, status);
      setDeposits((prev) =>
        prev.map((d) => (d.id === depositId ? res.data : d))
      );
      toast.success(`Deposit ${status}`);
    } catch (err) {
      console.error('[DepositTable] Status update failed:', err.message);
      toast.error('Failed to update status');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' };
      case 'rejected':
        return { background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' };
      default:
        return { background: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>💰 Deposit Transactions</h3>
        <button onClick={fetchDeposits} style={styles.refreshBtn} title="Refresh">
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {loading && deposits.length === 0 ? (
        <p style={styles.loadingText}>Loading deposits...</p>
      ) : deposits.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No deposits yet. Deposits will appear here when customers use the deposit option on WhatsApp.</p>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>User ID</th>
                <th style={styles.th}>WhatsApp</th>
                <th style={styles.th}>Transaction ID</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((dep, index) => (
                <tr key={dep.id} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}><strong>{dep.customerName}</strong></td>
                  <td style={styles.td}>{dep.customerNumber}</td>
                  <td style={styles.td}>{dep.whatsappNumber || '—'}</td>
                  <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '12px' }}>{dep.transactionId}</td>
                  <td style={{ ...styles.td, fontWeight: '700', color: '#27ae60' }}>₹{dep.amount}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.statusBadge, ...getStatusStyle(dep.status) }}>
                      {dep.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontSize: '12px', color: '#888' }}>
                    {new Date(dep.timestamp).toLocaleString()}
                  </td>
                  <td style={styles.td}>
                    {dep.status === 'pending' && (
                      <div style={styles.actionBtns}>
                        <button
                          onClick={() => handleStatusUpdate(dep.id, 'approved')}
                          style={styles.approveBtn}
                          title="Approve"
                        >
                          <FiCheck />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(dep.id, 'rejected')}
                          style={styles.rejectBtn}
                          title="Reject"
                        >
                          <FiX />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={styles.autoRefresh}>Auto-refreshes every 15 seconds</p>
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
    marginBottom: '22px',
  },
  title: { margin: 0, fontSize: '17px', fontWeight: '700', color: '#1a1a2e' },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 18px',
    border: '1.5px solid #667eea',
    borderRadius: '10px',
    background: 'transparent',
    color: '#667eea',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '13px',
  },
  loadingText: { textAlign: 'center', color: '#999', fontSize: '14px', padding: '40px 0' },
  emptyState: {
    textAlign: 'center',
    padding: '48px 20px',
    color: '#999',
    border: '2px dashed #e0e0e0',
    borderRadius: '12px',
    fontSize: '14px',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '10px',
    border: '1px solid #f0f0f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
    minWidth: '700px',
  },
  th: {
    padding: '13px 14px',
    textAlign: 'left',
    background: '#f8f9ff',
    color: '#888',
    fontWeight: '700',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #f0f0f0',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '13px 14px',
    borderBottom: '1px solid #f5f5f5',
    whiteSpace: 'nowrap',
    color: '#444',
  },
  trEven: { background: '#fff' },
  trOdd: { background: '#fafbfc' },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: '700',
    display: 'inline-block',
    letterSpacing: '0.3px',
  },
  actionBtns: {
    display: 'flex',
    gap: '6px',
  },
  approveBtn: {
    border: 'none',
    background: '#27ae60',
    color: '#fff',
    borderRadius: '8px',
    padding: '7px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  rejectBtn: {
    border: 'none',
    background: '#e74c3c',
    color: '#fff',
    borderRadius: '8px',
    padding: '7px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  autoRefresh: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#ccc',
    marginTop: '14px',
  },
};

export default DepositTable;
