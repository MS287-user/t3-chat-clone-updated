import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  /**
   * Use the same origin by default so login works in local, preview, and production.
   * If you need a custom URL, make it a public environment variable.
   */
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "",
});
