import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d69330642aa248598eb7112101eb52c2',
  appName: 'Croowa',
  webDir: 'dist',
  server: {
    url: 'https://d6933064-2aa2-4859-8eb7-112101eb52c2.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK'
    }
  }
};

export default config;