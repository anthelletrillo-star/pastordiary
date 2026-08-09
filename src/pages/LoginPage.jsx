import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Mail, ArrowLeft } from 'lucide-react';
import './LoginPage.css';

const API_URL = import.meta.env.VITE_API_URL || '';

export const LoginPage = () => {
  const { signIn } = useAuth();
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return;
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
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setMessage('A 6-digit code has been sent to your email.');
      setStep('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
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
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      // OTP verified! Now sign in with Supabase using a magic link or password
      // Since the backend confirmed the user, we use signInWithPassword
      // with a known convention or use the session directly
      setMessage('Verified! Signing you in...');
      
      // For now, sign in using Supabase's signInWithOtp (email magic link)
      // This sends another email but auto-signs in if the user is already confirmed
      const { supabase } = await import('../services/supabaseClient');
      const { error: signInError } = await supabase.auth.signInWithOtp({ 
        email,
        options: { shouldCreateUser: true }
      });
      
      if (signInError) {
        // Fallback: If Supabase OTP doesn't work, just set a flag
        console.error('Supabase sign-in error:', signInError);
        setError('Email verified but sign-in failed. Please try again.');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setOtp(['', '', '', '', '', '']);
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
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP');
      setMessage('New code sent to your email.');
    } catch (err) {
      setError(err.message);
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

        {step === 'email' ? (
          <form className="login-form" onSubmit={handleSendOTP}>
            {error && <div className="login-error">{error}</div>}

            <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '20px', textAlign: 'center' }}>
              Enter your email to receive a login code.
            </p>

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
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Sending Code...' : 'Send Login Code'}
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleVerifyOTP}>
            <button
              type="button"
              onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setError(''); setMessage(''); }}
              style={{ background: 'none', border: 'none', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '20px', fontSize: '0.875rem' }}
            >
              <ArrowLeft size={16} /> Change email
            </button>

            {error && <div className="login-error">{error}</div>}
            {message && (
              <div className="login-error" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#4ade80' }}>
                {message}
              </div>
            )}

            <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '8px', textAlign: 'center' }}>
              Enter the 6-digit code sent to
            </p>
            <p style={{ color: '#ffffff', fontSize: '0.875rem', marginBottom: '24px', textAlign: 'center', fontWeight: '600' }}>
              {email}
            </p>

            <div className="otp-inputs" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => otpRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="otp-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </form>
        )}

        <p className="login-footer">
          For the glory of God alone. ✝️
        </p>
      </div>
    </div>
  );
};
