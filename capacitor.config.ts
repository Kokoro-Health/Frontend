import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'health.kokoro',
  appName: 'Kokoro',
  webDir: 'build',
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'http://localhost:5173',
    cleartext: true,
    allowNavigation: [process.env.CAPACITOR_ALLOW_NAV || 'localhost'],
  },
};

export default config;