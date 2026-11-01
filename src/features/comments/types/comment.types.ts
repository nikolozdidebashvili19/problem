export type CommentView = {
  id: string;
  body: string;
  // null when the author deleted their account
  authorName: string | null;
  createdAt: string;
  canDelete: boolean;
};

export type CommentPage = {
  items: CommentView[];
  nextCursor: string | null;
};
