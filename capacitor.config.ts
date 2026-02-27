import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.paperpress.app',
  appName: 'PaperPress',

  // Required but not used since we load remote URL
  webDir: 'dist',

  server: {
    url: 'https://paperpressapp.vercel.app',
    cleartext: false,
    androidScheme: 'https',
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      showSpinner: false,
      backgroundColor: '#1E88E5',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      launchFadeOutDuration: 300,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1E88E5',
      overlayWebview: false,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },

  android: {
    backgroundColor: '#1E88E5',
  },
};

export default config;