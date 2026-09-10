import { PrismaClient, Role, SizeTier, ServiceType } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  const passwordHash = await argon2.hash('password123');

  // 1. Create Super Admin
  const admin = await prisma.user.upsert({
    where: { phone: '01000000000' },
    update: {},
    create: {
      phone: '01000000000',
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });
  console.log('Created Admin: 01000000000 / password123');

  // 2. Create Hub & Hub Manager
  const hubManagerUser = await prisma.user.upsert({
    where: { phone: '01111111111' },
    update: {},
    create: {
      phone: '01111111111',
      passwordHash,
      role: Role.HUB_MANAGER,
    },
  });
  
  let hub = await prisma.hub.findFirst({
    where: { name: 'Dhaka Central Hub' }
  });
  
  if (!hub) {
    hub = await prisma.hub.create({
      data: {
        name: 'Dhaka Central Hub',
        division: 'Dhaka',
        district: 'Dhaka',
        upazilaOrThana: 'Motijheel',
        addressLine: 'Motijheel, Dhaka',
      },
    });
  }
  
  await prisma.user.update({
    where: { id: hubManagerUser.id },
    data: { hubId: hub.id },
  });
  console.log('Created Hub Manager: 01111111111 / password123 (Dhaka Central Hub)');

  // 3. Create Rider
  const riderUser = await prisma.user.upsert({
    where: { phone: '01222222222' },
    update: {},
    create: {
      phone: '01222222222',
      passwordHash,
      role: Role.RIDER,
      hubId: hub.id,
    },
  });

  const rider = await prisma.rider.upsert({
    where: { userId: riderUser.id },
    update: { isApproved: true },
    create: {
      userId: riderUser.id,
      vehicleType: 'MOTORCYCLE',
      nidNumber: '1234567890',
      coverageZone: 'Motijheel, Paltan',
      isApproved: true,
      hubId: hub.id,
    },
  });
  console.log('Created Rider: 01222222222 / password123');

  // 4. Create Merchant
  const merchantUser = await prisma.user.upsert({
    where: { phone: '01333333333' },
    update: {},
    create: {
      phone: '01333333333',
      passwordHash,
      role: Role.MERCHANT,
    },
  });

  const merchant = await prisma.merchant.upsert({
    where: { userId: merchantUser.id },
    update: {},
    create: {
      userId: merchantUser.id,
      businessName: 'Gadget Store BD',
      businessAddress: 'Dhanmondi, Dhaka',
      contactPersonName: 'Mr. Gadget',
    },
  });

  // Ensure merchant has a wallet
  await prisma.merchantWallet.upsert({
    where: { merchantId: merchant.id },
    update: {},
    create: {
      merchantId: merchant.id,
      balancePaisa: 0,
    }
  });
  console.log('Created Merchant: 01333333333 / password123');

  const pickupAddress = await prisma.address.create({
    data: {
      division: 'Dhaka',
      district: 'Dhaka',
      upazilaOrThana: 'Dhanmondi',
      area: 'Dhanmondi',
      addressLine: 'Road 27',
    }
  });

  const deliveryAddress1 = await prisma.address.create({
    data: {
      division: 'Dhaka',
      district: 'Dhaka',
      upazilaOrThana: 'Gulshan',
      area: 'Gulshan',
      addressLine: 'Road 11, Block F',
    }
  });

  const deliveryAddress2 = await prisma.address.create({
    data: {
      division: 'Chittagong',
      district: 'Chittagong',
      upazilaOrThana: 'Agrabad',
      area: 'Agrabad',
      addressLine: 'CDA Avenue',
    }
  });

  // 5. Create some Parcels for the Merchant
  const parcel1 = await prisma.parcel.create({
    data: {
      merchantId: merchant.id,
      recipientName: 'Alice Smith',
      recipientPhone: '01999999999',
      pickupAddressId: pickupAddress.id,
      deliveryAddressId: deliveryAddress1.id,
      weightGrams: 500,
      sizeTier: SizeTier.SMALL,
      serviceType: ServiceType.STANDARD,
      codAmount: 150000, // 1500 BDT
      status: 'PENDING',
    }
  });

  const parcel2 = await prisma.parcel.create({
    data: {
      merchantId: merchant.id,
      recipientName: 'Bob Jones',
      recipientPhone: '01888888888',
      pickupAddressId: pickupAddress.id,
      deliveryAddressId: deliveryAddress2.id,
      weightGrams: 2000,
      sizeTier: SizeTier.LARGE,
      serviceType: ServiceType.EXPRESS,
      codAmount: 500000, // 5000 BDT
      status: 'IN_TRANSIT',
      destinationHubId: hub.id,
    }
  });

  console.log('Created demo parcels.');

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
