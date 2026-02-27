"use client";

type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

export async function triggerHaptic(type: HapticType = 'light') {
  if (typeof window === 'undefined') return;
  
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    
    switch (type) {
      case 'light':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'selection':
        await Haptics.selection();
        break;
      case 'success':
        await Haptics.notification({ type: 'success' });
        break;
      case 'warning':
        await Haptics.notification({ type: 'warning' });
        break;
      case 'error':
        await Haptics.notification({ type: 'error' });
        break;
    }
  } catch (e) {
    // Haptics not available or plugin not installed
  }
}

export function useHaptic(type: HapticType = 'light') {
  return () => triggerHaptic(type);
}
