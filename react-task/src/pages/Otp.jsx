import { useState } from 'react';
import { sendOtp, verifyOtp } from '../api';

export default function Otp({ phone, onBack, onSuccess }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!/^\d{4,6}$/.test(otp)) {
      setError('Enter the OTP sent to your number');
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOtp(phone, otp);
      onSuccess(data.token);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setInfo('');
    try {
      await sendOtp(phone);
      setInfo('OTP sent again');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="screen" onSubmit={handleSubmit}>
      <button type="button" className="link back" onClick={onBack}>
        &larr; Back
      </button>

      <div className="hero">
        <h1>Verify OTP</h1>
        <p>We sent a code to +91 {phone}</p>
      </div>

      <label className="field">
        <span>OTP</span>
        <input
          className="otp-input"
          type="tel"
          inputMode="numeric"
          maxLength={6}
          placeholder="------"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          autoFocus
        />
      </label>

      {error && <p className="error">{error}</p>}
      {info && <p className="info">{info}</p>}

      <button className="btn" type="submit" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify & Login'}
      </button>

      <button type="button" className="link" onClick={handleResend}>
        Resend OTP
      </button>
    </form>
  );
}
