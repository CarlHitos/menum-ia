type ServerEnv = {
  authSecret: string;
  authGoogleId: string;
  authGoogleSecret: string;
  authTrustHost: boolean;
  databaseUrl: string;
};

function getEnvValue(value: string | undefined, fallback: string) {
  return value && value.length > 0 ? value : fallback;
}

export function getServerEnv(): ServerEnv {
  return {
    authSecret: getEnvValue(
      process.env.AUTH_SECRET,
      "dev-auth-secret-change-me",
    ),
    authGoogleId: getEnvValue(
      process.env.AUTH_GOOGLE_ID,
      "google-client-id-placeholder",
    ),
    authGoogleSecret: getEnvValue(
      process.env.AUTH_GOOGLE_SECRET,
      "google-client-secret-placeholder",
    ),
    authTrustHost: process.env.AUTH_TRUST_HOST !== "false",
    databaseUrl: getEnvValue(
      process.env.DATABASE_URL,
      "postgres://placeholder:placeholder@localhost:5432/menumia",
    ),
  };
}
