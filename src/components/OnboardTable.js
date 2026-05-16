import React from 'react';

const OnboardTable = ({ accounts }) => {
  if (!accounts || accounts.length === 0) {
    return (
      <div style={styles.empty}>
        <p>No onboarded users yet.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>User ID</th>
              <th style={styles.th}>WhatsApp Number</th>
              <th style={styles.th}>Option Chosen</th>
              <th style={styles.th}>Time</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc, i) => (
              <tr key={acc.id} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td style={styles.td}>{i + 1}</td>
                <td style={styles.td}>{acc.customerName}</td>
                <td style={styles.td}>{acc.userId || '—'}</td>
                <td style={styles.td}>{acc.whatsappNumber}</td>
                <td style={styles.td}>{acc.selectedOption || '—'}</td>
                <td style={styles.td}>{new Date(acc.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '8px',
  },
  empty: {
    padding: '32px',
    textAlign: 'center',
    color: '#999',
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
  },
  th: {
    background: '#f8f9ff',
    padding: '12px 14px',
    textAlign: 'left',
    fontWeight: '700',
    color: '#888',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #f0f0f0',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid #f5f5f5',
    color: '#444',
  },
  rowEven: {
    background: '#fff',
  },
  rowOdd: {
    background: '#fafbfc',
  },
};

export default OnboardTable;
