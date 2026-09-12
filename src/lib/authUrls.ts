const PUBLISHED_ORIGIN = 'https://calculadora.motoboy.online';

const isLocalPreview = (hostname: string) =>
  hostname === 'localhost' || hostname === '127.0.0.1';

const isLovablePreview = (hostname: string) => hostname.endsWith('.lovable.app');

export const getAuthOrigin = () => {
  if (typeof window === 'undefined') return PUBLISHED_ORIGIN;

  const { hostname, origin } = window.location;
  if (isLocalPreview(hostname) || isLovablePreview(hostname)) return origin;

  return PUBLISHED_ORIGIN;
};

export const getAuthCallbackUrl = (returnTo = '/') => {
  const callback = new URL('/auth', getAuthOrigin());
  callback.searchParams.set('returnTo', returnTo === '/admin' ? '/admin' : '/');
  return callback.toString();
};

export const getPasswordResetUrl = () =>
  new URL('/reset-password', getAuthOrigin()).toString();