import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.69b91360b02f44aa8c54c4a2c4d2fc63',
  appName: 'selfhost-fortress',
  webDir: 'dist',
  server: {
    url: 'https://69b91360-b02f-44aa-8c54-c4a2c4d2fc63.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    }
  }
};

export default config;