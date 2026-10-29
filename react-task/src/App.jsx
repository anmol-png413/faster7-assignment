import { useState } from 'react';
import Login from './pages/Login';
import Otp from './pages/Otp';
import Restaurants from './pages/Restaurants';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [phone, setPhone] = useState(null); // set after step 1, moves us to the OTP screen

  function handleLogin(newToken) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setPhone(null);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  return (
    <div className="app">
      {token ? (
        <Restaurants token={token} onLogout={handleLogout} />
      ) : phone ? (
        <Otp phone={phone} onBack={() => setPhone(null)} onSuccess={handleLogin} />
      ) : (
        <Login onOtpSent={setPhone} />
      )}
    </div>
  );
}
