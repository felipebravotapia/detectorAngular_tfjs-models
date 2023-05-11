import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'detector',
  webDir: 'dist/detector',
  server: {
    androidScheme: 'https'
  }
};

export default config;
