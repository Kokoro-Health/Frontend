import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'health.kokoro',
  appName: 'Kokoro',
  webDir: 'build',
  server: {
    url: "http://10.0.2.2:5173",
    cleartext: true,
    allowNavigation: ["10.238.69.191"]
  }
};

export default config;
