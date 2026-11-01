import { createHash } from 'node:crypto';

import { describe, it, expect } from 'vitest';

import { CloudinaryClient } from './cloudinary';

const credentials = { cloudName: 'demo-cloud', apiKey: '1234', apiSecret: 'shh' };
const NOW = 1_800_000_000_000;

describe('CloudinaryClient', () => {
  it('is disabled when any credential is missing', () => {
    expect(new CloudinaryClient({ cloudName: 'x', apiKey: 'y' }).isConfigured()).toBe(false);
    expect(new CloudinaryClient({ cloudName: 'x', apiKey: 'y' }).signUpload(NOW)).toBeNull();
    expect(new CloudinaryClient(credentials).isConfigured()).toBe(true);
  });

  it('signs the sorted upload params with the API secret', () => {
    const signed = new CloudinaryClient(credentials).signUpload(NOW)!;
    const expectedPayload =
      `allowed_formats=jpg,jpeg,png,webp,heic&folder=problem-ge/reports&tags=pending&timestamp=${NOW / 1000}`;
    expect(signed).toMatchObject({
      cloudName: 'demo-cloud',
      apiKey: '1234',
      timestamp: NOW / 1000,
      folder: 'problem-ge/reports',
      tags: 'pending',
    });
    expect(signed.signature).toBe(createHash('sha1').update(expectedPayload + 'shh').digest('hex'));
  });

  it('only accepts images from our cloud and folder', () => {
    const client = new CloudinaryClient(credentials);
    const own = {
      publicId: 'problem-ge/reports/abc',
      url: 'https://res.cloudinary.com/demo-cloud/image/upload/v1/problem-ge/reports/abc.jpg',
      width: 100,
      height: 100,
    };
    expect(client.isOwnedImage(own)).toBe(true);
    expect(client.isOwnedImage({ ...own, publicId: 'other/abc' })).toBe(false);
    expect(client.isOwnedImage({ ...own, url: 'https://evil.example/abc.jpg' })).toBe(false);
    expect(client.isOwnedImage({ ...own, url: 'https://res.cloudinary.com/other-cloud/image/upload/abc.jpg' })).toBe(false);
  });
});
