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
      <nav className="tabs">
        <a className="tab" href="https://faster7-assignment.vercel.app/" target="_blank" rel="noopener noreferrer">
          Node.js CRM
        </a>
        <span className="tab active">React App</span>
      </nav>
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
