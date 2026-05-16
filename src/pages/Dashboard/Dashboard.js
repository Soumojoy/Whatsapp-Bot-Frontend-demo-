import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { businessAPI } from '../../services/api';
import toast from 'react-hot-toast';
import BotPreviewCard from '../../components/BotPreviewCard';
import CreateBusinessModal from '../../components/CreateBusinessModal';
import { FiPlus, FiLogOut } from 'react-icons/fi';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    console.log('[Dashboard] Fetching businesses...');
    setLoading(true);
    try {
      const res = await businessAPI.getAll();
      setBusinesses(res.data);
      console.log('[Dashboard] Loaded', res.data.length, 'businesses');
    } catch (err) {
      console.error('[Dashboard] Failed to fetch businesses:', err.message);
      toast.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessCreated = (newBusiness) => {
    console.log('[Dashboard] New business created:', newBusiness.businessName);
    setBusinesses((prev) => [...prev, newBusiness]);
    setShowCreateModal(false);
    toast.success('Business created!');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this business?')) return;
    console.log('[Dashboard] Deleting business:', id);
    try {
      await businessAPI.delete(id);
      setBusinesses((prev) => prev.filter((b) => b.id !== id));
      toast.success('Business deleted');
    } catch (err) {
      console.error('[Dashboard] Delete failed:', err.message);
      toast.error('Failed to delete business');
    }
  };

  const handleLogout = () => {
    console.log('[Dashboard] Logging out');
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>🤖 Professor Bot</h1>
          <p style={styles.headerSub}>Welcome, {user?.name || 'User'}</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <FiLogOut /> Logout
        </button>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Your Businesses</h2>
          <button onClick={() => setShowCreateModal(true)} style={styles.addBtn}>
            <FiPlus /> New Business
          </button>
        </div>

        {loading ? (
          <p style={styles.loadingText}>Loading businesses...</p>
        ) : businesses.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No businesses yet. Create your first bot!</p>
            <button onClick={() => setShowCreateModal(true)} style={styles.addBtn}>
              <FiPlus /> Create Business
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {businesses.map((biz) => (
              <BotPreviewCard
                key={biz.id}
                business={biz}
                onManage={() => navigate(`/business/${biz.id}`)}
                onDelete={() => handleDelete(biz.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Business Modal */}
      {showCreateModal && (
        <CreateBusinessModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleBusinessCreated}
        />
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5' },
  header: {
    background: '#fff',
    padding: '16px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    borderBottom: '1px solid #eee',
  },
  headerTitle: { margin: 0, fontSize: '24px', fontWeight: '800', color: '#1a1a2e', letterSpacing: '-0.5px' },
  headerSub: { margin: '2px 0 0', fontSize: '13px', color: '#999', fontWeight: '400' },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 22px',
    border: '1.5px solid #e74c3c',
    borderRadius: '10px',
    background: 'transparent',
    color: '#e74c3c',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    letterSpacing: '0.2px',
  },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '36px 32px' },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
  },
  sectionTitle: { margin: 0, fontSize: '20px', fontWeight: '700', color: '#1a1a2e', letterSpacing: '-0.3px' },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 24px',
    border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
    letterSpacing: '0.2px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '24px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    background: '#fff',
    borderRadius: '16px',
    border: '2px dashed #ddd',
  },
  emptyText: { color: '#999', fontSize: '16px', marginBottom: '20px' },
  loadingText: { textAlign: 'center', color: '#999', fontSize: '15px', padding: '60px 0' },
};

export default Dashboard;
