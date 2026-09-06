const API_URL = 'http://localhost:4000';

async function runTests() {
  const riderPhone = `+1555${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  const adminPhone = `+1555${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  const password = 'Password123!';

  console.log(`Testing RBAC...`);

  // 1. Register RIDER
  let res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: riderPhone, password, role: 'RIDER' }),
  });
  if (!res.ok) throw new Error('Register RIDER failed');
  const riderData = await res.json();
  const riderToken = riderData.accessToken;

  // 2. Register SUPER_ADMIN
  res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: adminPhone, password, role: 'SUPER_ADMIN' }),
  });
  if (!res.ok) throw new Error('Register SUPER_ADMIN failed');
  const adminData = await res.json();
  const adminToken = adminData.accessToken;

  // Test 1: Hit SUPER_ADMIN-only route as RIDER (expect 403)
  res = await fetch(`${API_URL}/api/protected/admin`, {
    headers: { Authorization: `Bearer ${riderToken}` },
  });
  if (res.status !== 403) throw new Error(`Expected 403 for RIDER on admin route, got ${res.status}`);
  console.log('✅ RIDER correctly denied on admin route (403)');

  // Test 2: Hit SUPER_ADMIN-only route as SUPER_ADMIN (expect 200)
  res = await fetch(`${API_URL}/api/protected/admin`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (res.status !== 200) throw new Error(`Expected 200 for SUPER_ADMIN on admin route, got ${res.status}`);
  console.log('✅ SUPER_ADMIN correctly allowed on admin route (200)');

  // Test 3: Hit ANY authenticated route as RIDER (expect 200)
  res = await fetch(`${API_URL}/api/protected/any`, {
    headers: { Authorization: `Bearer ${riderToken}` },
  });
  if (res.status !== 200) throw new Error(`Expected 200 for RIDER on any route, got ${res.status}`);
  console.log('✅ RIDER correctly allowed on any authenticated route (200)');

  // Test 4: Hit routes without token (expect 401)
  res = await fetch(`${API_URL}/api/protected/admin`);
  if (res.status !== 401) throw new Error(`Expected 401 for missing token on admin route, got ${res.status}`);
  console.log('✅ Missing token correctly denied on admin route (401)');

  res = await fetch(`${API_URL}/api/protected/any`);
  if (res.status !== 401) throw new Error(`Expected 401 for missing token on any route, got ${res.status}`);
  console.log('✅ Missing token correctly denied on any authenticated route (401)');

  console.log('ALL TESTS PASSED!');
}

runTests().catch(console.error);
