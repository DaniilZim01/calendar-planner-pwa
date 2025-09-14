export type IdentityMode = 'login' | 'email';

export const IDENTITY_MODE: IdentityMode = (process.env.AUTH_IDENTITY_MODE === 'email' ? 'email' : 'login');


