const BASE = 'https://staging.fastor.ai/v1';
const DIAL_CODE = '+91';

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: body ? new URLSearchParams(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  // The API reports failures in the body ("status": "Failed"), not only via HTTP status.
  if (!res.ok || !json || json.status !== 'Success') {
    throw new Error(json?.error_message || 'Something went wrong. Please try again.');
  }
  return json.data;
}

export const sendOtp = (phone) =>
  request('/pwa/user/register', { method: 'POST', body: { phone, dial_code: DIAL_CODE } });

export const verifyOtp = (phone, otp) =>
  request('/pwa/user/login', { method: 'POST', body: { phone, otp, dial_code: DIAL_CODE } });

export const fetchRestaurants = (token, cityId = 118) =>
  request(`/m/restaurant?city_id=${cityId}`, { token });
