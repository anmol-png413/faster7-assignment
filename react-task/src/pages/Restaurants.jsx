import { useEffect, useState } from 'react';
import { fetchRestaurants } from '../api';

// The API's logo URLs can 404, so fall back to an initial instead of a broken image icon.
function Logo({ src, name }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return <div className="logo-fallback">{name.trim().charAt(0).toUpperCase()}</div>;
  }
  return <img src={src} alt={name} onError={() => setFailed(true)} />;
}

export default function Restaurants({ token, onLogout }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchRestaurants(token)
      .then((data) => !cancelled && setRestaurants(data.results))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="screen">
      <header className="topbar">
        <h1>Restaurants</h1>
        <button className="link" onClick={onLogout}>
          Logout
        </button>
      </header>

      {loading && <p className="muted">Loading restaurants...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && restaurants.length === 0 && <p className="muted">No restaurants found.</p>}

      <ul className="list">
        {restaurants.map((r) => (
          <li key={r.restaurant_id} className="card">
            <Logo src={r.logo} name={r.restaurant_name} />
            <div className="info-col">
              <h2>{r.restaurant_name}</h2>
              {/* API sends the literal string "null" when there is no address */}
              {r.address_complete && r.address_complete !== 'null' && <p>{r.address_complete}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
