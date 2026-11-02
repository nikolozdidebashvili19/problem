type ThreadableComment = {
  id: string;
  parentId: string | null;
};

export type CommentThread<T> = {
  id: string;
  // null when the top-level comment was deleted but its replies remain
  root: T | null;
  replies: T[];
};

// Groups a flat, oldest-first list into one-level threads, keeping the order in which threads first appear
export function groupCommentThreads<T extends ThreadableComment>(comments: T[]): CommentThread<T>[] {
  const threads = new Map<string, CommentThread<T>>();
  for (const comment of comments) {
    const id = comment.parentId ?? comment.id;
    const thread = threads.get(id) ?? { id, root: null, replies: [] };
    if (comment.parentId) thread.replies.push(comment);
    else thread.root = comment;
    threads.set(id, thread);
  }
  return [...threads.values()];
}
