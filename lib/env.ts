export function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSetupStatus() {
  return {
    databaseUrl: Boolean(process.env.DATABASE_URL),
    jwtSecret: Boolean(process.env.JWT_SECRET)
  };
}

export function requireServerConfig() {
  const missing = Object.entries(getSetupStatus())
    .filter(([, configured]) => !configured)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing required server configuration: ${missing.join(", ")}`);
  }
}
