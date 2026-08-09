import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';

export const LoginPage = () => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (isSignUp) {
        const res = await signUp(email, password);
        if (res?.user && !res?.session) {
          setMessage('Account created! Check your email to confirm, or try logging in.');
        } else {
          setMessage('Account created successfully!');
        }
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-icon">
            <BookOpen size={32} color="white" />
          </div>
          <h1 className="login-title">Pastor's Diary</h1>
          <p className="login-subtitle">Shepherd's Library</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="auth-mode-toggle" style={{ display: 'flex', marginBottom: '20px', borderRadius: '10px', background: '#09090b', padding: '4px', border: '1px solid #27272a' }}>
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(''); setMessage(''); }}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: !isSignUp ? '#27272a' : 'transparent', color: !isSignUp ? '#ffffff' : '#a1a1aa', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(''); setMessage(''); }}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: isSignUp ? '#27272a' : 'transparent', color: isSignUp ? '#ffffff' : '#a1a1aa', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {message && (
            <div className="login-error" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#4ade80' }}>
              {message}
            </div>
          )}

          <div className="login-field">
            <div className="login-input-wrap">
              <Mail size={18} className="login-input-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="login-input"
              />
            </div>
          </div>

          <div className="login-field">
            <div className="login-input-wrap">
              <Lock size={18} className="login-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="login-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (isSignUp ? 'Creating Account...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p className="login-footer">
          For the glory of God alone. ✝️
        </p>
      </div>
    </div>
  );
};
