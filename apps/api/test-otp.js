const API_URL = 'http://localhost:4000';
const { exec } = require('child_process');

async function runTests() {
  const phone = `+1555${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  const password = 'Password123!';

  console.log(`Testing OTP with phone: ${phone}`);

  // 1. Register a user first so verify can update them
  let res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password, role: 'RIDER' }),
  });
  if (!res.ok) throw new Error('Register failed');
  console.log('Registered user.');

  // 2. Request OTP 3 times
  for (let i = 1; i <= 3; i++) {
    res = await fetch(`${API_URL}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(`OTP request ${i} failed unexpectedly: ${JSON.stringify(error)}`);
    }
    console.log(`OTP request ${i} succeeded`);
  }

  // 3. Request OTP 4th time - should fail
  res = await fetch(`${API_URL}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  if (res.ok) {
    throw new Error('4th OTP request should have failed due to rate limit');
  }
  const errorData = await res.json();
  console.log('4th OTP request failed as expected with:', errorData);

  // 4. Get the OTP from Redis manually for testing purposes
  // Iioredis could be used, or just a simple command if we were in TS, but here we just use child_process redis-cli if available, 
  // or we can just fetch it using a simple node script.
  // Actually, let's just make a small script to fetch it from Redis
}

runTests().catch(console.error);
