import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sendOTP, verifyOTP, clearError, resetOtp, selectAuth } from '../../store/slices/authSlice';
import { Button, Input } from '../../components/common/UI';
import styles from './LoginPage.module.css';

const RESEND_SECS = 60;

export default function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const auth      = useSelector(selectAuth);

  const [phone, setPhone]     = useState('');
  const [otp,   setOtp]       = useState('');
  const [timer, setTimer]     = useState(0);
  const [errors, setErrors]   = useState({});

  // Auto-redirect after login
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      const dest = auth.user.role === 'admin' ? '/admin'
                 : auth.user.role === 'vendor' ? '/vendor'
                 : '/farmer';
      navigate(dest, { replace: true });
    }
  }, [auth.isAuthenticated, auth.user, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const validatePhone = () => {
    if (!phone.trim()) return 'Phone number is required';
    if (!/^\+?[1-9]\d{9,14}$/.test(phone.replace(/\s/g, '')))
      return 'Enter a valid phone number (e.g. +919876543210)';
    return null;
  };

  const handleSendOTP = async () => {
    const err = validatePhone();
    if (err) { setErrors({ phone: err }); return; }
    setErrors({});
    const result = await dispatch(sendOTP(phone.trim()));
    if (!result.error) setTimer(RESEND_SECS);
  };

  const handleVerify = async () => {
    if (otp.length !== 6) { setErrors({ otp: 'Enter the 6-digit OTP' }); return; }
    setErrors({});
    await dispatch(verifyOTP({ phone: phone.trim(), otp }));
  };

  const handleBack = () => {
    dispatch(resetOtp());
    setOtp('');
    setErrors({});
  };

  return (
    <div className={styles.page}>
      {/* Left panel */}
      <div className={styles.left}>
        <div className={styles.brand}>
          <div className={styles.logoMark}>C</div>
          <span className={styles.logoText}>Camaron</span>
        </div>
        <div className={styles.leftContent}>
          <h1>Smart Aquaculture.<br />Smarter Farmers.</h1>
          <p>Join 1,000+ farms across India managing feed, ponds and harvests on one intelligent platform.</p>
          <div className={styles.featureList}>
            {[
              ['🌊', 'Track pond cycles in real-time'],
              ['📦', 'Order certified feeds from verified vendors'],
              ['📊', 'AI-driven harvest predictions'],
              ['💬', 'Expert support within 48 hours'],
            ].map(([icon, text]) => (
              <div key={text} className={styles.featureItem}>
                <span className={styles.featureIcon}>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.wave} />
      </div>

      {/* Right panel */}
      <div className={styles.right}>
        <div className={styles.card}>
          {!auth.otpSent ? (
            <>
              <h2 className={styles.cardTitle}>Sign In / Register</h2>
              <p className={styles.cardSub}>Enter your mobile number. Use OTP <strong>121212</strong> for demo login.</p>

              <div className={styles.form}>
                <Input
                  label="Mobile Number"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors({}); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                  error={errors.phone}
                  prefix="📱"
                  autoFocus
                />

                {auth.error && <p className={styles.apiError}>{auth.error}</p>}

                <Button
                  fullWidth
                  size="lg"
                  loading={auth.loading}
                  onClick={handleSendOTP}
                >
                  Send OTP
                </Button>
              </div>

              <p className={styles.terms}>
                By continuing you agree to our{' '}
                <a href="/terms">Terms of Service</a> and{' '}
                <a href="/privacy">Privacy Policy</a>.
              </p>
            </>
          ) : (
            <>
              <button className={styles.backBtn} onClick={handleBack}>← Back</button>
              <h2 className={styles.cardTitle}>Verify OTP</h2>
              <p className={styles.cardSub}>
                We sent a 6-digit code to <strong>{phone}</strong>
              </p>

              <div className={styles.form}>
                <Input
                  label="One-Time Password"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setErrors({}); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  error={errors.otp}
                  autoFocus
                  className={styles.otpInput}
                />

                {auth.error && <p className={styles.apiError}>{auth.error}</p>}

                <Button
                  fullWidth
                  size="lg"
                  loading={auth.loading}
                  onClick={handleVerify}
                >
                  Verify & Login
                </Button>

                <div className={styles.resend}>
                  {timer > 0 ? (
                    <span className={styles.timerText}>Resend OTP in {timer}s</span>
                  ) : (
                    <button
                      className={styles.resendBtn}
                      onClick={handleSendOTP}
                      disabled={auth.loading}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
