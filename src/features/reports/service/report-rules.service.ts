import { UserDocument } from '@/features/auth/schema/user.schema';
import { reportRepository } from '@/features/reports/repository/report.repository';
import { ReportDocument } from '@/features/reports/schema/report.schema';
import { ReportImage } from '@/features/reports/types/report.types';
import { NEW_ACCOUNT_AGE_MS, NEW_ACCOUNT_REPORTS_PER_DAY, REPORTS_PER_HOUR } from '@/shared/const/reports.const';
import { cloudinary } from '@/shared/lib/cloudinary';
import { hasRole } from '@/shared/utils/roles';

// Authors may edit until the first status change, so a popular report can't be rewritten (PRODUCT §10)
export const EDITABLE_STATUSES: readonly string[] = ['reported'];

export const isModerator = (user: UserDocument) => hasRole(user.role, 'moderator');

export const isAuthor = (report: ReportDocument, userId: string | undefined) => report.authorId.toString() === userId;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// Photos are mandatory evidence once uploads are configured (PRODUCT §1); until then posting works without them
export function validateImages(images: ReportImage[]): string | null {
  if (!cloudinary.isConfigured()) return images.length > 0 ? 'UPLOADS_DISABLED' : null;
  if (images.length === 0) return 'PHOTO_REQUIRED';
  return images.every((image) => cloudinary.isOwnedImage(image)) ? null : 'INVALID_IMAGE';
}

export async function checkPostingLimits(user: UserDocument, now: Date): Promise<string | null> {
  const userId = user._id.toString();
  const lastHour = await reportRepository.countByAuthorSince(userId, new Date(now.getTime() - HOUR_MS));
  if (lastHour >= REPORTS_PER_HOUR) return 'RATE_LIMITED';

  const isNewAccount = now.getTime() - user.createdAt.getTime() < NEW_ACCOUNT_AGE_MS;
  if (!isNewAccount) return null;
  const lastDay = await reportRepository.countByAuthorSince(userId, new Date(now.getTime() - DAY_MS));
  return lastDay >= NEW_ACCOUNT_REPORTS_PER_DAY ? 'NEW_ACCOUNT_LIMIT' : null;
}
