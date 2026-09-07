import { spawn } from 'child_process';
import { io } from 'socket.io-client';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTests() {
  console.log('Starting Server 1 on port 3003...');
  const server1 = spawn('npx', ['tsx', 'src/server.ts'], { env: { ...process.env, PORT: '3003' }, shell: true });
  
  console.log('Starting Server 2 on port 3004...');
  const server2 = spawn('npx', ['tsx', 'src/server.ts'], { env: { ...process.env, PORT: '3004' }, shell: true });

  // keep the console.log hooks for debugging early
  server1.stdout.on('data', d => console.log('[S1]', d.toString().trim()));
  server2.stdout.on('data', d => console.log('[S2]', d.toString().trim()));
  server1.stderr.on('data', d => console.log('[S1 ERR]', d.toString().trim()));
  server2.stderr.on('data', d => console.log('[S2 ERR]', d.toString().trim()));

  const waitForServer = (serverStream) => {
    return new Promise(resolve => {
      serverStream.on('data', d => {
        const out = d.toString();
        if (out.includes('Running on')) resolve();
      });
    });
  };

  await Promise.all([
    waitForServer(server1.stdout),
    waitForServer(server2.stdout)
  ]);

  console.log('\n--- 1. Testing Invalid Auth ---');
  const invalidClient = io('http://localhost:3003', { auth: { token: 'invalid' } });
  
  await new Promise(resolve => {
    invalidClient.on('connect_error', (err) => {
      console.log('✅ Invalid token rejected as expected:', err.message);
      invalidClient.close();
      resolve();
    });
  });

  const missingTokenClient = io('http://localhost:3003');
  await new Promise(resolve => {
    missingTokenClient.on('connect_error', (err) => {
      console.log('✅ Missing token rejected as expected:', err.message);
      missingTokenClient.close();
      resolve();
    });
  });

  console.log('\n--- 2. Setting up test data ---');
  const phone = `+1555${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  
  let res = await fetch(`http://localhost:3003/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password: 'Password123!', role: 'RIDER' }),
  });
  let data = await res.json();
  if (!res.ok) throw new Error('Register failed: ' + JSON.stringify(data));
  const token = data.accessToken;
  
  // Extract userId from JWT payload
  const payloadBase64 = token.split('.')[1];
  const payloadJson = Buffer.from(payloadBase64, 'base64').toString();
  const userId = JSON.parse(payloadJson).userId;

  await fetch(`http://localhost:3003/riders/onboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ vehicleType: 'BICYCLE', nidNumber: '1234567890', coverageZone: 'Downtown' }),
  });

  // Approve rider and create mock merchant/addresses/parcel directly via Prisma
  const rider = await prisma.rider.update({
    where: { userId },
    data: { isApproved: true }
  });

  const mockMerchantUser = await prisma.user.create({
    data: { phone: `+1555${Math.floor(Math.random() * 1000000)}`, passwordHash: 'hash', role: 'MERCHANT' }
  });
  const mockMerchant = await prisma.merchant.create({
    data: { userId: mockMerchantUser.id, businessName: 'Test', businessAddress: '123', contactPersonName: 'John' }
  });
  const address = await prisma.address.create({
    data: { division: 'A', district: 'B', upazilaOrThana: 'C', area: 'D', addressLine: '123' }
  });
  const parcel = await prisma.parcel.create({
    data: {
      merchantId: mockMerchant.id,
      riderId: rider.id,
      recipientName: 'Test',
      recipientPhone: '123',
      pickupAddressId: address.id,
      deliveryAddressId: address.id,
      weightGrams: 1000,
      sizeTier: 'SMALL',
      codAmount: 0,
      serviceType: 'STANDARD',
      status: 'PICKED_UP'
    }
  });

  console.log(`Created Parcel ${parcel.id} for Rider ${rider.id}`);

  console.log('\n--- 3. Testing Valid Auth & Cross-Instance Throttled Broadcast ---');
  const client1 = io('http://localhost:3003', { auth: { token } });
  const client2 = io('http://localhost:3004/tracking'); // different instance, tracking namespace!

  await new Promise(resolve => {
    client1.on('connected', (payload) => {
      console.log('✅ Client 1 received connected ack!', payload);
      resolve();
    });
  });

  await new Promise(resolve => client2.on('connect', resolve));
  console.log('Client 2 connected to tracking namespace');
  
  client2.emit('join_room', `parcel:${parcel.id}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // wait for join

  let updateCount = 0;
  client2.on('location:update', (payload) => {
    console.log('✅ Client 2 received location:update!', payload);
    updateCount++;
  });

  console.log('Client 1 rapidly emitting rider:location 5 times...');
  for (let i = 0; i < 5; i++) {
    client1.emit('rider:location', { latitude: 23.8, longitude: 90.4 });
  }

  await new Promise(resolve => setTimeout(resolve, 3000));
  
  if (updateCount === 1) {
    console.log('✅ Throttling working! Only 1 update broadcasted across nodes.');
  } else {
    console.log(`❌ Throttling FAILED! Received ${updateCount} updates.`);
  }

  console.log('\nALL TESTS FINISHED');
  server1.kill();
  server2.kill();
  process.exit(updateCount === 1 ? 0 : 1);
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
