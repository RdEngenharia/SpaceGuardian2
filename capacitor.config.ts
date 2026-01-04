import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rdengenharia.spaceguardian',
  appName: 'Spaceguardian2',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;