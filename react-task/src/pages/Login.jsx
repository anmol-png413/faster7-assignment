import { useState } from 'react';
import { sendOtp } from '../api';

export default function Login({ onOtpSent }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(phone)) {
      setError('Enter a valid 10 digit mobile number');
      return;
    }
    setLoading(true);
    try {
      await sendOtp(phone);
      onOtpSent(phone);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="screen" onSubmit={handleSubmit}>
      <div className="hero">
        <h1>Welcome</h1>
        <p>Enter your mobile number to continue</p>
      </div>

      <label className="field">
        <span>Mobile number</span>
        <div className="phone-input">
          <span className="prefix">+91</span>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="98XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            autoFocus
          />
        </div>
      </label>

      {error && <p className="error">{error}</p>}

      <button className="btn" type="submit" disabled={loading}>
        {loading ? 'Sending OTP...' : 'Get OTP'}
      </button>
    </form>
  );
}
