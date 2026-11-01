import { UserDocument } from '@/features/auth/schema/user.schema';
import { reportRepository } from '@/features/reports/repository/report.repository';
import { isVotableStatus } from '@/features/reports/service/report-card.service';
import { VoteResult } from '@/features/reports/types/report.types';
import { VoteType } from '@/features/reports/validations/report.validation';
import { voteRepository } from '@/features/votes/repository/vote.repository';
import { ServiceResult } from '@/shared/types/common';

// Sets the desired vote state (not a toggle) so double taps and retries are idempotent
export async function setVoteService(
  user: UserDocument,
  shortId: string,
  input: VoteType
): Promise<ServiceResult<VoteResult>> {
  const report = await reportRepository.findByShortId(shortId);
  if (!report || report.hidden) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (report.authorId.toString() === user._id.toString()) return { data: { error: 'OWN_REPORT' }, status: 403 };
  if (!isVotableStatus(report.status)) return { data: { error: 'VOTING_CLOSED' }, status: 409 };

  const userId = user._id.toString();
  const reportId = report._id.toString();
  const changed = input.voted
    ? await voteRepository.insertIfAbsent(userId, reportId)
    : await voteRepository.deleteOne(userId, reportId);
  const updated = changed ? await reportRepository.incrementUpvotes(reportId, input.voted ? 1 : -1) : report;

  return { data: { voted: input.voted, upvoteCount: updated?.upvoteCount ?? report.upvoteCount }, status: 200 };
}
