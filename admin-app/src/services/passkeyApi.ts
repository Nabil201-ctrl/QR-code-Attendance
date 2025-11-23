import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/types';

import { API_BASE_URL } from '../constants/env';

const BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/admin/passkey`;

export const getRegistrationOptions = async (username: string) => {
  const response = await fetch(`${BASE_URL}/register-request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });
  return response.json();
};

export const verifyRegistration = async (username: string, registrationResponse: RegistrationResponseJSON) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, ...registrationResponse }),
  });
  return response.json();
};

export const getAuthenticationOptions = async () => {
  const response = await fetch(`${BASE_URL}/login-request`, {
    method: 'POST',
  });
  return response.json();
};

export const verifyAuthentication = async (authenticationResponse: AuthenticationResponseJSON) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(authenticationResponse),
  });
  return response.json();
};

export const verifySimpleLogin = async (username: string, passkey: string) => {
  const base = API_BASE_URL.replace(/\/$/, '');
  const url = `${base}/admin/simple-login`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, passkey }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || 'Simple login failed');
  }

  return response.json();
};
