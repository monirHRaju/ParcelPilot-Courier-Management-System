import { Redis } from 'ioredis';

const API_URL = 'http://localhost:4000';
const redis = new Redis('redis://127.0.0.1:6379');

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

  // 4. Get the OTP from Redis manually for testing verify
  const otpCode = await redis.get(`auth:otp:${phone}`);
  if (!otpCode) throw new Error('OTP not found in Redis!');
  console.log('Retrieved OTP from Redis:', otpCode);

  // 5. Verify OTP
  res = await fetch(`${API_URL}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code: otpCode }),
  });
  const verifyData = await res.json();
  if (!res.ok) throw new Error(`Verify failed: ${JSON.stringify(verifyData)}`);
  console.log('Verify succeeded:', verifyData);

  // 6. Check that OTP is deleted from Redis
  const deletedOtp = await redis.get(`auth:otp:${phone}`);
  if (deletedOtp) throw new Error('OTP was not deleted from Redis after verification!');
  console.log('OTP deleted from Redis as expected.');

  console.log('ALL TESTS PASSED!');
  process.exit(0);
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
