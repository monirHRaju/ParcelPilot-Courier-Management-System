const API_URL = 'http://localhost:4000';

async function runTests() {
  const phone = `+1555${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  const password = 'Password123!';

  console.log(`Testing with phone: ${phone}`);

  // 1. Register
  let res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password, role: 'RIDER' }),
  });
  let data = await res.json();
  console.log('Register:', data);
  if (!res.ok) throw new Error('Register failed');

  let { accessToken, refreshToken } = data;

  // 2. Login
  res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  data = await res.json();
  console.log('Login:', data);
  if (!res.ok) throw new Error('Login failed');

  accessToken = data.accessToken;
  refreshToken = data.refreshToken;

  // 3. Protected Route
  res = await fetch(`${API_URL}/api/protected`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  data = await res.json();
  console.log('Protected Route:', data);
  if (!res.ok) throw new Error('Protected route failed');

  // 4. Refresh Token
  res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  data = await res.json();
  console.log('Refresh Token:', data);
  if (!res.ok) throw new Error('Refresh failed');

  accessToken = data.accessToken;
  const newRefreshToken = data.refreshToken;

  // 5. Logout
  res = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: newRefreshToken }),
  });
  data = await res.json();
  console.log('Logout:', data);
  if (!res.ok) throw new Error('Logout failed');

  // 6. Refresh Token Again (Should fail)
  res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: newRefreshToken }),
  });
  data = await res.json();
  console.log('Refresh after logout (expect error):', data);
  if (res.ok) throw new Error('Refresh after logout succeeded, but should fail');

  console.log('ALL TESTS PASSED!');
}

runTests().catch(console.error);
