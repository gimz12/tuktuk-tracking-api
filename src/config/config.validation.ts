type Validator = (value: string | undefined) => string;

const required: Validator = (v) => {
  if (v === undefined || v === '') {
    throw new Error('required value missing');
  }
  return v;
};

const optional =
  (fallback: string): Validator =>
  (v) =>
    v && v !== '' ? v : fallback;

const RULES: Record<string, Validator> = {
  NODE_ENV: optional('development'),
  PORT: optional('3000'),
  MONGODB_URI: required,
  JWT_SECRET: required,
  JWT_EXPIRES_IN: optional('8h'),
  JWT_DEVICE_SECRET: required,
  JWT_DEVICE_EXPIRES_IN: optional('30d'),
  BOOTSTRAP_ADMIN_EMAIL: optional('admin@police.gov.lk'),
  BOOTSTRAP_ADMIN_PASSWORD: optional('ChangeMe!Admin#2026'),
  THROTTLE_TTL: optional('60'),
  THROTTLE_LIMIT: optional('120'),
};

export function validateEnv(env: Record<string, string | undefined>) {
  const errors: string[] = [];
  const validated: Record<string, string> = {};

  for (const [key, rule] of Object.entries(RULES)) {
    try {
      validated[key] = rule(env[key]);
    } catch (e) {
      errors.push(`${key}: ${(e as Error).message}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Config validation failed:\n  ${errors.join('\n  ')}`);
  }

  return { ...env, ...validated };
}
