import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { businessAPI, flowAPI, onboardAPI } from '../../services/api';
import toast from 'react-hot-toast';
import FlowBuilder from '../../components/FlowBuilder';
import BotPreviewCard from '../../components/BotPreviewCard';
import DepositTable from '../../components/DepositTable';
import OnboardTable from '../../components/OnboardTable';
import ChatHistory from '../../components/ChatHistory';
import PaymentOptionsManager from '../../components/PaymentOptionsManager';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [flows, setFlows] = useState([]);
  const [onboardAccounts, setOnboardAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    botName: '',
    greetingMessage: '',
    paymentQrUrl: '',
    paymentMode: 'single',
    onboardingEnabled: false,
    onboardingMessage: '',
    onboardingOptions: '',
  });

  useEffect(() => {
    fetchBusiness();
    fetchOnboardAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchBusiness = async () => {
    console.log('[BusinessDetail] Fetching business:', id);
    setLoading(true);
    try {
      const res = await businessAPI.getById(id);
      setBusiness(res.data);
      setFlows(res.data.flows || []);
      setForm({
        businessName: res.data.businessName,
        botName: res.data.botName,
        greetingMessage: res.data.greetingMessage,
        paymentQrUrl: res.data.paymentQrUrl || '',
        paymentMode: res.data.paymentMode || 'single',
        onboardingEnabled: res.data.onboardingEnabled || false,
        onboardingMessage: res.data.onboardingMessage || '',
        onboardingOptions: res.data.onboardingOptions || '',
      });
      console.log('[BusinessDetail] Loaded:', res.data.businessName);
    } catch (err) {
      console.error('[BusinessDetail] Failed:', err.message);
      toast.error('Failed to load business');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    console.log('[BusinessDetail] Updating business:', form);
    try {
      const res = await businessAPI.update(id, form);
      setBusiness(res.data);
      setEditMode(false);
      toast.success('Business updated!');
    } catch (err) {
      console.error('[BusinessDetail] Update failed:', err.message);
      toast.error('Failed to update');
    }
  };

  const fetchOnboardAccounts = async () => {
    try {
      const res = await onboardAPI.getByBusiness(id);
      setOnboardAccounts(res.data);
    } catch (err) {
      console.error('[BusinessDetail] Failed to load onboard accounts:', err.message);
    }
  };

  const handleFlowCreated = (flow) => {
    console.log('[BusinessDetail] Flow created:', flow.optionTitle);
    setFlows((prev) => [...prev, flow]);
  };

  const handleFlowDeleted = async (flowId) => {
    console.log('[BusinessDetail] Deleting flow:', flowId);
    try {
      await flowAPI.delete(flowId);
      setFlows((prev) => prev.filter((f) => f.id !== flowId));
      toast.success('Flow deleted');
    } catch (err) {
      console.error('[BusinessDetail] Flow delete failed:', err.message);
      toast.error('Failed to delete flow');
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!business) return <div style={styles.loading}>Business not found</div>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          <FiArrowLeft /> Back
        </button>
        <h1 style={styles.headerTitle}>{business.businessName}</h1>
      </header>

      <main style={styles.main}>
        <div style={styles.twoCol}>
          {/* Left: Bot Preview + Settings */}
          <div style={styles.leftCol}>
            <BotPreviewCard business={business} />

            {/* Edit Business */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Business Settings</h3>
                <button onClick={() => setEditMode(!editMode)} style={styles.editBtn}>
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editMode ? (
                <div style={styles.editForm}>
                  <div style={styles.field}>
                    <label style={styles.label}>Business Name</label>
                    <input
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Bot Name</label>
                    <input
                      value={form.botName}
                      onChange={(e) => setForm({ ...form, botName: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Greeting Message</label>
                    <textarea
                      value={form.greetingMessage}
                      onChange={(e) => setForm({ ...form, greetingMessage: e.target.value })}
                      style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                    />
                  </div>
                  {/* Payment Options Manager */}
                  <PaymentOptionsManager
                    businessId={id}
                    business={form}
                    onBusinessUpdated={(updated) => {
                      setBusiness(updated);
                      setForm((prev) => ({ ...prev, paymentMode: updated.paymentMode }));
                    }}
                  />

                  {/* Onboarding Settings */}
                  <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '8px' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#1a1a2e' }}>📝 Onboarding / Create Account</h4>
                    <div style={styles.field}>
                      <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={form.onboardingEnabled}
                          onChange={(e) => setForm({ ...form, onboardingEnabled: e.target.checked })}
                        />
                        Enable "Create Account" option in menu
                      </label>
                    </div>
                    {form.onboardingEnabled && (
                      <>
                        <div style={styles.field}>
                          <label style={styles.label}>Onboarding Message (shown to user first)</label>
                          <textarea
                            value={form.onboardingMessage}
                            onChange={(e) => setForm({ ...form, onboardingMessage: e.target.value })}
                            placeholder="Welcome! Here's how our platform works..."
                            style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                          />
                        </div>
                        <div style={styles.field}>
                          <label style={styles.label}>Options (comma-separated)</label>
                          <input
                            value={form.onboardingOptions}
                            onChange={(e) => setForm({ ...form, onboardingOptions: e.target.value })}
                            placeholder="Basic, Premium, VIP"
                            style={styles.input}
                          />
                          <span style={{ fontSize: '11px', color: '#888' }}>
                            These options are shown to the user after the onboarding message.
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <button onClick={handleUpdate} style={styles.saveBtn}>
                    <FiSave /> Save Changes
                  </button>
                </div>
              ) : (
                <div>
                  <p><strong>Bot Name:</strong> {business.botName}</p>
                  <p><strong>Virtual Number:</strong> {business.virtualNumber}</p>
                  <p><strong>Greeting:</strong> {business.greetingMessage}</p>
                  <p><strong>Payment Mode:</strong> {business.paymentMode === 'multiple' ? '🔀 Multiple (Batch-based)' : '💳 Single'}</p>
                  <p><strong>Create Account:</strong> {business.onboardingEnabled ? '✅ Enabled' : '❌ Disabled'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Flow Builder */}
          <div style={styles.rightCol}>
            <FlowBuilder
              businessId={id}
              flows={flows}
              onFlowCreated={handleFlowCreated}
              onFlowDeleted={handleFlowDeleted}
            />
          </div>
        </div>

        {/* Deposit Transactions Table — Full Width */}
        <DepositTable businessId={id} />

        {/* User Management — Onboarded Accounts */}
        <div style={{ ...styles.card, marginTop: '24px' }}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>👥 User Management</h3>
          </div>
          <OnboardTable accounts={onboardAccounts} />
        </div>

        {/* Chat History */}
        <ChatHistory businessId={id} />
      </main>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f5f6fa' },
  header: {
    background: '#fff',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    border: '1.5px solid #ddd',
    borderRadius: '8px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  },
  headerTitle: { margin: 0, fontSize: '20px', color: '#1a1a2e' },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '32px' },
  twoCol: { display: 'flex', gap: '32px', flexWrap: 'wrap' },
  leftCol: { flex: '1', minWidth: '340px', display: 'flex', flexDirection: 'column', gap: '24px' },
  rightCol: { flex: '1.5', minWidth: '400px' },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  cardTitle: { margin: 0, fontSize: '18px', color: '#1a1a2e' },
  editBtn: {
    padding: '6px 16px',
    borderRadius: '6px',
    border: '1.5px solid #667eea',
    background: 'transparent',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  editForm: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#555' },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1.5px solid #ddd',
    fontSize: '14px',
    outline: 'none',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    background: '#27ae60',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#888',
  },
};

export default BusinessDetail;
