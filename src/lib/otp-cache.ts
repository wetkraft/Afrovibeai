/**
 * A simple in-memory cache for storing OTPs.
 * In a production, multi-server environment, this should be replaced
 * with a shared cache like Redis or a database.
 * 
 * This implementation uses a global symbol to ensure a single cache instance
 * across different module evaluations in a serverless environment during a hot start.
 */
interface OtpData {
  otp: string;
  expiry: number;
}

const GLOBAL_OTP_CACHE_KEY = Symbol.for('app.otp.cache');

type GlobalWithOtpCache = typeof globalThis & {
  [GLOBAL_OTP_CACHE_KEY]?: Map<string, OtpData>;
};

// Use the global cache if it exists, otherwise create it.
const getOtpCache = (): Map<string, OtpData> => {
  const globalWithCache = globalThis as GlobalWithOtpCache;
  if (!globalWithCache[GLOBAL_OTP_CACHE_KEY]) {
    globalWithCache[GLOBAL_OTP_CACHE_KEY] = new Map<string, OtpData>();
  }
  return globalWithCache[GLOBAL_OTP_CACHE_KEY]!;
};

export const otpCache = getOtpCache();
