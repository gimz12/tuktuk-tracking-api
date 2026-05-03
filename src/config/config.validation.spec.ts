import { validateEnv } from './config.validation';

describe('validateEnv', () => {
  const validEnv = {
    MONGODB_URI: 'mongodb://localhost:27017/test',
    JWT_SECRET: 'a-test-secret',
    JWT_DEVICE_SECRET: 'a-different-test-secret',
  };

  it('returns the merged env when required vars are present', () => {
    const result = validateEnv(validEnv);
    expect(result.MONGODB_URI).toBe('mongodb://localhost:27017/test');
    expect(result.JWT_SECRET).toBe('a-test-secret');
  });

  it('applies sensible defaults for optional vars', () => {
    const result = validateEnv(validEnv);
    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe('3000');
    expect(result.JWT_EXPIRES_IN).toBe('8h');
    expect(result.THROTTLE_LIMIT).toBe('120');
  });

  it('throws when MONGODB_URI is missing', () => {
    const env = { ...validEnv, MONGODB_URI: undefined };
    expect(() => validateEnv(env)).toThrow(/MONGODB_URI/);
  });

  it('throws when JWT_SECRET is empty', () => {
    const env = { ...validEnv, JWT_SECRET: '' };
    expect(() => validateEnv(env)).toThrow(/JWT_SECRET/);
  });

  it('reports all missing required vars at once', () => {
    expect(() => validateEnv({})).toThrow(/MONGODB_URI[\s\S]*JWT_SECRET[\s\S]*JWT_DEVICE_SECRET/);
  });
});
