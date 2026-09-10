import { pricingService } from '../pricing.service.js';
import { SizeTier, ServiceType } from '@prisma/client';

describe('Pricing Service - calculatePrice', () => {
  it('should calculate correct price for Same-city Small Standard parcel with no COD', () => {
    const result = pricingService.calculatePrice({
      pickupDistrict: 'Dhaka',
      deliveryDistrict: 'dhaka', // Case-insensitive test
      sizeTier: SizeTier.SMALL,
      serviceType: ServiceType.STANDARD,
      codAmount: 0
    });

    expect(result.baseFee).toBe(6000); // 60 BDT
    expect(result.codHandlingFee).toBe(0);
    expect(result.totalFee).toBe(6000);
  });

  it('should calculate correct price for Inter-city Large Express parcel', () => {
    const result = pricingService.calculatePrice({
      pickupDistrict: 'Dhaka',
      deliveryDistrict: 'Chittagong',
      sizeTier: SizeTier.LARGE,
      serviceType: ServiceType.EXPRESS,
      codAmount: 0
    });

    // Intercity Large = 180 BDT + Express 40 BDT = 220 BDT
    expect(result.baseFee).toBe(22000); 
    expect(result.totalFee).toBe(22000);
  });

  it('should correctly calculate 1% COD fee', () => {
    const result = pricingService.calculatePrice({
      pickupDistrict: 'Dhaka',
      deliveryDistrict: 'Dhaka',
      sizeTier: SizeTier.SMALL,
      serviceType: ServiceType.STANDARD,
      codAmount: 500000 // 5000 BDT
    });

    expect(result.baseFee).toBe(6000);
    expect(result.codHandlingFee).toBe(5000); // 1% of 5000 BDT = 50 BDT (5000 paisa)
    expect(result.totalFee).toBe(11000);
  });
});
