"use client";

export const AUTH_COOKIE = "auth_token";

export function setAuthCookie(value: string, days = 1) {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  document.cookie = `${AUTH_COOKIE}=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

export function clearAuthCookie() {
  document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}