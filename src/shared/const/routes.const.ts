export const AUTH_ROUTES = ['/sign-in', '/sign-up'];

// Cookie-only check in the proxy; pages and APIs still verify the user server-side
export const PROTECTED_ROUTES = ['/dashboard', '/report', '/notifications'];

export const ROUTES = {
  home: '/',
  signIn: '/sign-in',
  newReport: '/report/new',
  notifications: '/notifications',
  report: (shortId: string, slug: string) => `/r/${shortId}/${slug}`,
  editReport: (shortId: string) => `/report/${shortId}/edit`,
} as const;
