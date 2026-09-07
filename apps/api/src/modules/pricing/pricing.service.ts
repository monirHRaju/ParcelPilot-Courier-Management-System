import { SizeTier, ServiceType } from '@prisma/client';

export type PricingInput = {
  pickupDistrict: string;
  deliveryDistrict: string;
  sizeTier: SizeTier;
  serviceType: ServiceType;
  codAmount: number;
};

export const pricingService = {
  calculatePrice(data: PricingInput): { baseFee: number; codHandlingFee: number; totalFee: number } {
    // Determine intracity vs intercity (case-insensitive string match)
    const isIntracity = data.pickupDistrict.trim().toLowerCase() === data.deliveryDistrict.trim().toLowerCase();

    // Define base prices in paisa (1 BDT = 100 Paisa)
    // Base fee is mapped to size tiers
    let baseFee = 0;
    switch (data.sizeTier) {
      case SizeTier.SMALL:
        baseFee = isIntracity ? 6000 : 10000; // 60 BDT / 100 BDT
        break;
      case SizeTier.MEDIUM:
        baseFee = isIntracity ? 8000 : 12000; // 80 BDT / 120 BDT
        break;
      case SizeTier.LARGE:
        baseFee = isIntracity ? 12000 : 18000; // 120 BDT / 180 BDT
        break;
      default:
        baseFee = 6000;
    }

    // Express surcharge logic (+40 BDT)
    if (data.serviceType === ServiceType.EXPRESS) {
      baseFee += 4000;
    }

    // COD Handling fee (1% of COD Amount)
    // We use Math.round() to ensure it rounds to the nearest integer cleanly instead of truncating
    const codHandlingFee = Math.round(data.codAmount * 0.01);

    const totalFee = baseFee + codHandlingFee;

    return {
      baseFee,
      codHandlingFee,
      totalFee,
    };
  }
};
