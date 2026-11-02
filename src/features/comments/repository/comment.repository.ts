import { CommentDocument, CommentModel } from '@/features/comments/schema/comment.schema';
import { mongo } from '@/shared/lib/mongo';

import type { QueryFilter } from 'mongoose';

export const commentRepository = {
  async findPage(filter: QueryFilter<CommentDocument>, limit: number): Promise<CommentDocument[]> {
    await mongo.connect();
    return CommentModel.find(filter).sort({ createdAt: 1, _id: 1 }).limit(limit).lean<CommentDocument[]>().exec();
  },

  async findByAuthor(filter: QueryFilter<CommentDocument>, limit: number): Promise<CommentDocument[]> {
    await mongo.connect();
    return CommentModel.find(filter).sort({ createdAt: -1, _id: -1 }).limit(limit).lean<CommentDocument[]>().exec();
  },

  async count(filter: QueryFilter<CommentDocument>): Promise<number> {
    await mongo.connect();
    return CommentModel.countDocuments(filter).exec();
  },

  async findById(id: string): Promise<CommentDocument | null> {
    await mongo.connect();
    return CommentModel.findById(id).lean<CommentDocument>().exec();
  },

  async create(data: { reportId: string; authorId: string; body: string; parentId?: string }): Promise<CommentDocument> {
    await mongo.connect();
    const doc = await CommentModel.create(data);
    return doc.toObject() as CommentDocument;
  },

  // Only flips a live comment, so a double delete cannot decrement the counter twice
  async softDelete(id: string): Promise<boolean> {
    await mongo.connect();
    const result = await CommentModel.updateOne({ _id: id, deletedAt: null }, { $set: { deletedAt: new Date() } });
    return result.modifiedCount > 0;
  },
};
