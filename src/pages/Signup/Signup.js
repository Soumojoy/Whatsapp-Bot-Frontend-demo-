import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[Signup] Form submitted:', { name, email });

    if (!name || !email || !password) {
      toast.error('Please fill all fields');
      console.warn('[Signup] Missing fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      console.warn('[Signup] Password too short');
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success('Account created successfully!');
      console.log('[Signup] Redirecting to dashboard');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Signup failed';
      toast.error(msg);
      console.error('[Signup] Failed:', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🤖 Professor Bot</h1>
        <p style={styles.subtitle}>Create your account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              style={styles.input}
              required
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
  },
  title: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
    margin: '0 0 4px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: '#888',
    textAlign: 'center',
    margin: '0 0 36px',
    fontSize: '15px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#444', letterSpacing: '0.3px' },
  input: {
    padding: '13px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e0e0e0',
    fontSize: '14px',
    outline: 'none',
    background: '#fafbfc',
  },
  button: {
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    letterSpacing: '0.3px',
    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.35)',
  },
  footer: {
    textAlign: 'center',
    marginTop: '28px',
    fontSize: '14px',
    color: '#888',
  },
  link: { color: '#667eea', fontWeight: '700', textDecoration: 'none' },
};

export default Signup;
