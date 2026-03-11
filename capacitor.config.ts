import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'health.kokoro',
  appName: 'Kokoro',
  webDir: 'build',
  server: {
    url: "http://10.238.69.191:5173",
    cleartext: true
  }
};

export default config;
