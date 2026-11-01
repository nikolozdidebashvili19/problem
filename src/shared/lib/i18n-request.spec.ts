import { describe, it, expect, vi, beforeEach } from 'vitest';

const cookieValue = vi.fn<() => string | undefined>();

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: () => (cookieValue() === undefined ? undefined : { value: cookieValue() }),
  })),
}));

vi.mock('next-intl/server', () => ({
  getRequestConfig: (factory: () => unknown) => factory,
}));

import { EN_MESSAGES } from '@/shared/const/messages-en.const';
import { KA_MESSAGES } from '@/shared/const/messages-ka.const';

import requestConfig from './i18n-request';

const resolveConfig = () => requestConfig({ requestLocale: Promise.resolve(undefined) });

describe('i18n request config', () => {
  beforeEach(() => cookieValue.mockReset());

  it('serves Georgian to first-time visitors', async () => {
    cookieValue.mockReturnValue(undefined);
    const config = await resolveConfig();
    expect(config.locale).toBe('ka');
    expect(config.messages).toBe(KA_MESSAGES);
    expect(config.timeZone).toBe('Asia/Tbilisi');
  });

  it('serves English when the visitor switched', async () => {
    cookieValue.mockReturnValue('en');
    const config = await resolveConfig();
    expect(config.locale).toBe('en');
    expect(config.messages).toBe(EN_MESSAGES);
  });

  it('ignores unsupported cookie values', async () => {
    cookieValue.mockReturnValue('ru');
    expect((await resolveConfig()).locale).toBe('ka');
  });
});
