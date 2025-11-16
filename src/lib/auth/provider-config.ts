import { env } from "@/env.mjs";

export const AUTH_PROVIDER_DEFINITIONS = [
  {
    id: "github",
    label: "Continue with GitHub",
    envKeys: ["GITHUB_ID", "GITHUB_SECRET"],
  },
  {
    id: "google",
    label: "Continue with Google",
    envKeys: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  },
  {
    id: "apple",
    label: "Continue with Apple",
    envKeys: ["APPLE_CLIENT_ID", "APPLE_CLIENT_SECRET"],
  },
] as const;

export type AuthProviderId = (typeof AUTH_PROVIDER_DEFINITIONS)[number]["id"];

export type AuthProviderMeta = {
  id: AuthProviderId;
  label: string;
};

const enabledProvidersCache = AUTH_PROVIDER_DEFINITIONS.filter((definition) =>
  definition.envKeys.every((key) => Boolean(env[key as keyof typeof env])),
).map(({ id, label }) => ({ id, label }));

export const getEnabledAuthProviders = (): AuthProviderMeta[] => {
  return [...enabledProvidersCache];
};

export const isAuthProviderEnabled = (id: AuthProviderId): boolean => {
  return enabledProvidersCache.some((provider) => provider.id === id);
};
