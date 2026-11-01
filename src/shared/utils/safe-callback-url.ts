// Only same-origin paths are allowed as post-login destinations (prevents open redirects like `//evil.com`)
export function safeCallbackUrl(value: string | null | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
  return value;
}
