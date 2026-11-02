export type CommentView = {
  id: string;
  // Top-level comment this replies to, null for top-level comments
  parentId: string | null;
  body: string;
  authorId: string;
  // null when the author deleted their account
  authorName: string | null;
  createdAt: string;
  canDelete: boolean;
};

export type CommentPage = {
  items: CommentView[];
  nextCursor: string | null;
};
