import { describe, it, expect } from 'vitest';

import { scaledSize } from './image-resize';

describe('scaledSize', () => {
  it('keeps images that already fit', () => {
    expect(scaledSize(1200, 800)).toEqual({ width: 1200, height: 800 });
  });

  it('scales the longest edge down to 2048px keeping the aspect ratio', () => {
    expect(scaledSize(4032, 3024)).toEqual({ width: 2048, height: 1536 });
    expect(scaledSize(3024, 4032)).toEqual({ width: 1536, height: 2048 });
  });
});
