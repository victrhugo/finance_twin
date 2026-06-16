export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
} as const;

export const DEFAULT_USER_PREFERENCES = {
  currency: 'USD',
  theme: 'dark',
  timezone: 'UTC',
};
