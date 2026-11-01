import { UserDocument, UserModel } from '@/features/auth/schema/user.schema';
import { mongo } from '@/shared/lib/mongo';

type CreateUserInput = Pick<UserDocument, 'name' | 'email'> &
  Partial<Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt' | 'name' | 'email'>>;

export const userRepository = {
  async findById(id: string): Promise<UserDocument | null> {
    await mongo.connect();
    return UserModel.findById(id).lean<UserDocument>().exec();
  },

  // Public fields only — used to show author names on report cards
  async findPublicByIds(ids: string[]): Promise<Pick<UserDocument, '_id' | 'name' | 'displayName' | 'deletedAt'>[]> {
    await mongo.connect();
    return UserModel.find({ _id: { $in: ids } }, { name: 1, displayName: 1, deletedAt: 1 })
      .lean<Pick<UserDocument, '_id' | 'name' | 'displayName' | 'deletedAt'>[]>()
      .exec();
  },

  async incrementReportsCount(id: string): Promise<void> {
    await mongo.connect();
    await UserModel.updateOne({ _id: id }, { $inc: { reportsCount: 1 } });
  },

  async findByEmail(email: string): Promise<UserDocument | null> {
    await mongo.connect();
    return UserModel.findOne({ email }).lean<UserDocument>().exec();
  },

  async findAll(page = 1, limit = 20): Promise<{ items: UserDocument[] }> {
    await mongo.connect();
    const skip = (page - 1) * limit;
    const items = await UserModel.find({}, null, { skip, limit }).lean<UserDocument[]>().exec();
    return { items };
  },

  async create(data: CreateUserInput): Promise<string> {
    await mongo.connect();
    const doc = await UserModel.create(data);
    return doc._id.toString();
  },

  async updateById(id: string, data: Partial<UserDocument>): Promise<boolean> {
    await mongo.connect();
    const result = await UserModel.findByIdAndUpdate(id, { $set: data });
    return result !== null;
  },

  async updateByEmail(email: string, data: Partial<UserDocument>): Promise<boolean> {
    await mongo.connect();
    const result = await UserModel.updateOne({ email }, { $set: data });
    return result.matchedCount > 0;
  },

  async deleteById(id: string): Promise<boolean> {
    await mongo.connect();
    const result = await UserModel.findByIdAndDelete(id);
    return result !== null;
  },
};
