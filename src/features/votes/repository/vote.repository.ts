import { VoteDocument, VoteModel } from '@/features/votes/schema/vote.schema';
import { mongo } from '@/shared/lib/mongo';

export const voteRepository = {
  async findByUserAndReports(userId: string, reportIds: string[]): Promise<VoteDocument[]> {
    await mongo.connect();
    return VoteModel.find({ userId, reportId: { $in: reportIds } }).lean<VoteDocument[]>().exec();
  },

  async findVoterIds(reportId: string, limit: number): Promise<string[]> {
    await mongo.connect();
    const votes = await VoteModel.find({ reportId }, { userId: 1 }).limit(limit).lean<VoteDocument[]>().exec();
    return votes.map((vote) => vote.userId.toString());
  },

  // Upsert on the unique (userId, reportId) index: returns true only when a new vote was created
  async insertIfAbsent(userId: string, reportId: string): Promise<boolean> {
    await mongo.connect();
    const result = await VoteModel.updateOne(
      { userId, reportId },
      { $setOnInsert: { userId, reportId } },
      { upsert: true }
    );
    return result.upsertedCount > 0;
  },

  async deleteOne(userId: string, reportId: string): Promise<boolean> {
    await mongo.connect();
    const result = await VoteModel.deleteOne({ userId, reportId });
    return result.deletedCount > 0;
  },
};
