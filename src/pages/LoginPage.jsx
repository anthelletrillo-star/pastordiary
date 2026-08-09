import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import './LoginPage.css';

const API_URL = import.meta.env.VITE_API_URL || '';

export const LoginPage = () => {
  const { signIn } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'verify-otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  // ── SIGN IN ──
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    }
    setLoading(false);
  };

  // ── SIGN UP (Step 1: send OTP) ──
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification code');
      setMessage('A 6-digit verification code has been sent to your email.');
      setMode('verify-otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // ── VERIFY OTP (Step 2: create account) ──
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      // Verify OTP with backend
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      // OTP verified! Now sign in with the password they just set
      setMessage('Account verified! Signing you in...');
      await signIn(email, password);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // ── OTP input handlers ──
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      setOtp(pastedData.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleResendOTP = async () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend code');
      setMessage('New code sent to your email.');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setMessage('');
    setOtp(['', '', '', '', '', '']);
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

        {/* ── SIGN IN FORM ── */}
        {mode === 'signin' && (
          <form className="login-form" onSubmit={handleSignIn}>
            <div className="auth-tabs">
              <button type="button" className="auth-tab active" onClick={() => switchMode('signin')}>Sign In</button>
              <button type="button" className="auth-tab" onClick={() => switchMode('signup')}>Sign Up</button>
            </div>

            {error && <div className="login-error">{error}</div>}

            <div className="login-field">
              <div className="login-input-wrap">
                <Mail size={18} className="login-input-icon" />
                <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className="login-input" />
              </div>
            </div>

            <div className="login-field">
              <div className="login-input-wrap">
                <Lock size={18} className="login-input-icon" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" className="login-input" />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="auth-switch">
              <button type="button" onClick={() => switchMode('signup')}>Don't have an account? <strong>Sign Up</strong></button>
            </div>
          </form>
        )}

        {/* ── SIGN UP FORM ── */}
        {mode === 'signup' && (
          <form className="login-form" onSubmit={handleSignUp}>
            <div className="auth-tabs">
              <button type="button" className="auth-tab" onClick={() => switchMode('signin')}>Sign In</button>
              <button type="button" className="auth-tab active" onClick={() => switchMode('signup')}>Sign Up</button>
            </div>

            {error && <div className="login-error">{error}</div>}

            <div className="login-field">
              <div className="login-input-wrap">
                <Mail size={18} className="login-input-icon" />
                <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className="login-input" />
              </div>
            </div>

            <div className="login-field">
              <div className="login-input-wrap">
                <Lock size={18} className="login-input-icon" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Create a password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" className="login-input" minLength={6} />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Sending verification code...' : 'Create Account'}
            </button>

            <div className="auth-switch">
              <button type="button" onClick={() => switchMode('signin')}>Already have an account? <strong>Sign In</strong></button>
            </div>
          </form>
        )}

        {/* ── OTP VERIFICATION ── */}
        {mode === 'verify-otp' && (
          <form className="login-form" onSubmit={handleVerifyOTP}>
            <button type="button" className="back-link" onClick={() => switchMode('signup')}>
              <ArrowLeft size={16} /> Back
            </button>

            {error && <div className="login-error">{error}</div>}
            {message && <div className="login-success">{message}</div>}

            <p className="otp-instruction">Enter the 6-digit code sent to</p>
            <p className="otp-email">{email}</p>

            <div className="otp-inputs" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => otpRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(index, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(index, e)}
                  className="otp-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <div className="auth-switch">
              <button type="button" onClick={handleResendOTP} disabled={loading}>
                Didn't receive the code? <strong>Resend</strong>
              </button>
            </div>
          </form>
        )}

        <p className="login-footer">For the glory of God alone. ✝️</p>
      </div>
    </div>
  );
};
