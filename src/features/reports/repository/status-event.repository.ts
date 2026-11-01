import { StatusEventDocument, StatusEventModel } from '@/features/reports/schema/status-event.schema';
import { mongo } from '@/shared/lib/mongo';

type CreateStatusEventInput = {
  reportId: string;
  actorId: string;
  from?: string;
  to: string;
  note?: string;
};

export const statusEventRepository = {
  async create(data: CreateStatusEventInput): Promise<void> {
    await mongo.connect();
    await StatusEventModel.create(data);
  },

  async findByReport(reportId: string): Promise<StatusEventDocument[]> {
    await mongo.connect();
    return StatusEventModel.find({ reportId }).sort({ createdAt: 1 }).lean<StatusEventDocument[]>().exec();
  },
};
