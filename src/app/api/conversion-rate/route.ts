
import { NextResponse } from 'next/server';

// This function now uses a fixed rate of 1 USD = 1600 NGN.
function getUsdConversionRate(): number {
    return 1 / 1600;
}

export async function GET() {
  try {
    const ngnToUsdRate = getUsdConversionRate();
    const usdToNgnRate = 1 / ngnToUsdRate;

    return NextResponse.json({ ngnToUsdRate, usdToNgnRate });
  } catch (error: any) {
    console.error('Error in conversion-rate API:', error);
    return NextResponse.json({ error: 'Failed to retrieve conversion rates.' }, { status: 500 });
  }
}
