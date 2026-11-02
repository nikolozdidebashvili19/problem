import { describe, it, expect } from 'vitest';

import { groupCommentThreads } from './comment-threads';

describe('groupCommentThreads', () => {
  it('nests replies under their comment and keeps thread order', () => {
    const threads = groupCommentThreads([
      { id: 'a', parentId: null },
      { id: 'b', parentId: null },
      { id: 'c', parentId: 'a' },
      { id: 'd', parentId: 'b' },
      { id: 'e', parentId: 'a' },
    ]);
    expect(threads.map((thread) => thread.id)).toEqual(['a', 'b']);
    expect(threads[0].replies.map((reply) => reply.id)).toEqual(['c', 'e']);
    expect(threads[1].replies.map((reply) => reply.id)).toEqual(['d']);
  });

  it('keeps replies whose top-level comment was deleted', () => {
    const [thread] = groupCommentThreads([{ id: 'c', parentId: 'gone' }]);
    expect(thread).toEqual({ id: 'gone', root: null, replies: [{ id: 'c', parentId: 'gone' }] });
  });

  it('returns nothing for an empty list', () => {
    expect(groupCommentThreads([])).toEqual([]);
  });
});
