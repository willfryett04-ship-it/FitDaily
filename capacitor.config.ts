import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fitdaily.app",
  appName: "Style Set",
  webDir: "public",
  server: {
    // The iPhone test build uses the deployed web app, so changes published to
    // Vercel appear in the app without rebuilding the native project.
    url: "https://fit-daily-ten.vercel.app",
    cleartext: false,
    allowNavigation: ["fit-daily-ten.vercel.app"],
  },
};

export default config;
