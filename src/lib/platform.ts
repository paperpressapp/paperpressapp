/**
 * Platform Detection Utility
 * Detects if running on web, Android, or iOS
 */

import { Capacitor } from '@capacitor/core';

export type Platform = 'web' | 'android' | 'ios';

export function getPlatform(): Platform {
  if (!Capacitor.isNativePlatform()) {
    return 'web';
  }
  
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  
  if (userAgent.toLowerCase().includes('android')) {
    return 'android';
  }
  
  if (userAgent.toLowerCase().includes('iphone') || userAgent.toLowerCase().includes('ipad')) {
    return 'ios';
  }
  
  // Default to android for Capacitor apps
  return 'android';
}

export function isCapacitor(): boolean {
  return Capacitor.isNativePlatform();
}

export function isAndroid(): boolean {
  return getPlatform() === 'android';
}

export function isWeb(): boolean {
  return getPlatform() === 'web';
}

export function isIOS(): boolean {
  return getPlatform() === 'ios';
}
