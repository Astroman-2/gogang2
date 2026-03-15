import React, { useState, useEffect, useRef } from 'react';
import { sleep, uid, generateOTP } from '../../utils/helpers';
import LoadingDots from '../shared/LoadingDots';

export default function AuthFlow({ onSuccess }) {
  const [step, setStep]               = useState('email'); // 'email' | 'otp'
  const [email, setEmail]             = useState('');
  const [otp, setOtp]                 = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [countdown, setCountdown]     = useState(0);
  const refs = useRef([]);

  /* Countdown timer */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* ── Send OTP ── */
  const sendOtp = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    await sleep(1200); // simulate network call
    const code = generateOTP();
    setGeneratedOtp(code);
    // In production: POST /api/auth/send-otp  { email }
    console.info('[LumiQ] OTP generated (demo):', code);
    setLoading(false);
    setStep('otp');
    setCountdown(60);
  };

  /* ── OTP input handlers ── */
  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  /* ── Verify OTP ── */
  const verifyOtp = async () => {
    const entered = otp.join('');
    if (entered.length < 6) { setError('Enter all 6 digits'); return; }
    setLoading(true);
    setError('');
    await sleep(800);
    if (entered === generatedOtp) {
      onSuccess({
        email,
        name: email.split('@')[0],
        id: uid(),
        avatar: email[0].toUpperCase(),
      });
    } else {
      setError('Incorrect OTP. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <span className="title-glow">Lumi</span>
          <span className="title-plain">Q</span>
        </div>

        {step === 'email' ? (
          <>
            <h2 className="auth-heading">Welcome ✦</h2>
            <p className="auth-sub">Sign in or create your account with email</p>

            <div className="field-group">
              <label className="field-label">Email Address</label>
              <input
                className="field-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                autoFocus
              />
              <span className="field-hint">We'll send a 6-digit code to verify your identity</span>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button className="btn-primary btn-full" onClick={sendOtp} disabled={loading}>
              {loading ? <LoadingDots /> : 'Send Verification Code →'}
            </button>
          </>
        ) : (
          <>
            <h2 className="auth-heading">Check your inbox ✉️</h2>
            <p className="auth-sub">
              Sent a 6-digit code to <strong>{email}</strong>
            </p>

            {/* Demo mode hint — remove in production */}
            <div className="otp-demo-hint">
              🔐 Demo mode — your code is:{' '}
              <strong style={{ letterSpacing: '0.2em' }}>{generatedOtp}</strong>
            </div>

            <div className="otp-inputs">
              {otp.map((v, i) => (
                <input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  className={`otp-box${v ? ' otp-filled' : ''}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={v}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKey(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button className="btn-primary btn-full" onClick={verifyOtp} disabled={loading}>
              {loading ? <LoadingDots /> : 'Verify & Enter →'}
            </button>

            <div className="auth-resend">
              {countdown > 0 ? (
                <span className="resend-timer">Resend in {countdown}s</span>
              ) : (
                <button
                  className="btn-ghost"
                  onClick={() => { sendOtp(); setOtp(Array(6).fill('')); }}
                >
                  Resend code
                </button>
              )}
              <button
                className="btn-ghost"
                onClick={() => { setStep('email'); setError(''); setOtp(Array(6).fill('')); }}
              >
                Change email
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
