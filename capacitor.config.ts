import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.paperpress.app',
  appName: 'PaperPress',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      showSpinner: false,
      backgroundColor: '#1565C0',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      launchFadeOutDuration: 500,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1565C0',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
  android: {
    backgroundColor: '#1565C0',
  },
};

export default config;
