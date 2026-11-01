import { ReportDocument, ReportModel } from '@/features/reports/schema/report.schema';
import { ReportImage } from '@/features/reports/types/report.types';
import { HOT_SCORE_DECAY_S, HOT_SCORE_EPOCH_S } from '@/shared/const/feed.const';
import { mongo } from '@/shared/lib/mongo';

import type { QueryFilter, UpdateQuery } from 'mongoose';

type ReportSort = Record<string, 1 | -1>;

// Document arrays are plain arrays on input; arrays/subdocs not listed start from schema defaults
export type CreateReportInput = Omit<
  ReportDocument,
  '_id' | 'createdAt' | 'updatedAt' | 'images' | 'officialResponses' | 'editHistory' | 'fixEvidence' | 'commentCount'
> & {
  images: ReportImage[];
  createdAt?: Date;
  updatedAt?: Date;
};

export const reportRepository = {
  async findFeed(filter: QueryFilter<ReportDocument>, sort: ReportSort, limit: number): Promise<ReportDocument[]> {
    await mongo.connect();
    return ReportModel.find(filter).sort(sort).limit(limit).lean<ReportDocument[]>().exec();
  },

  async findById(id: string): Promise<ReportDocument | null> {
    await mongo.connect();
    return ReportModel.findById(id).lean<ReportDocument>().exec();
  },

  async findByIds(ids: string[]): Promise<Pick<ReportDocument, '_id' | 'shortId' | 'slug' | 'title' | 'hidden'>[]> {
    await mongo.connect();
    return ReportModel.find({ _id: { $in: ids } }, { shortId: 1, slug: 1, title: 1, hidden: 1 })
      .lean<Pick<ReportDocument, '_id' | 'shortId' | 'slug' | 'title' | 'hidden'>[]>()
      .exec();
  },

  async findByIdempotencyKey(idempotencyKey: string): Promise<ReportDocument | null> {
    await mongo.connect();
    return ReportModel.findOne({ idempotencyKey }).lean<ReportDocument>().exec();
  },

  async countByAuthorSince(authorId: string, since: Date): Promise<number> {
    await mongo.connect();
    return ReportModel.countDocuments({ authorId, createdAt: { $gte: since } }).exec();
  },

  async create(data: CreateReportInput): Promise<ReportDocument> {
    await mongo.connect();
    const doc = await ReportModel.create(data);
    return doc.toObject() as ReportDocument;
  },

  async updateById(id: string, update: UpdateQuery<ReportDocument>): Promise<ReportDocument | null> {
    await mongo.connect();
    return ReportModel.findByIdAndUpdate(id, update, { new: true }).lean<ReportDocument>().exec();
  },

  async incrementCommentCount(id: string, delta: 1 | -1): Promise<void> {
    await mongo.connect();
    await ReportModel.updateOne({ _id: id }, { $inc: { commentCount: delta } });
  },

  async findByShortId(shortId: string): Promise<ReportDocument | null> {
    await mongo.connect();
    return ReportModel.findOne({ shortId }).lean<ReportDocument>().exec();
  },

  // Atomic counter update + hotScore recompute in one round trip (mirrors computeHotScore)
  async incrementUpvotes(id: string, delta: 1 | -1): Promise<ReportDocument | null> {
    await mongo.connect();
    return ReportModel.findByIdAndUpdate(
      id,
      [
        { $set: { upvoteCount: { $max: [{ $add: ['$upvoteCount', delta] }, 0] } } },
        {
          $set: {
            hotScore: {
              $add: [
                { $log10: { $max: ['$upvoteCount', 1] } },
                {
                  $divide: [
                    { $subtract: [{ $divide: [{ $toLong: '$createdAt' }, 1000] }, HOT_SCORE_EPOCH_S] },
                    HOT_SCORE_DECAY_S,
                  ],
                },
              ],
            },
          },
        },
      ],
      { new: true, updatePipeline: true }
    )
      .lean<ReportDocument>()
      .exec();
  },

  // Idempotent insert keyed by idempotencyKey; timestamps are passed explicitly
  async insertIfAbsent(data: CreateReportInput): Promise<void> {
    await mongo.connect();
    await ReportModel.updateOne(
      { idempotencyKey: data.idempotencyKey },
      { $setOnInsert: data },
      { upsert: true, timestamps: false }
    );
  },
};
