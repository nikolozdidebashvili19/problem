import mongoose from 'mongoose';

import { reportRepository } from '@/features/reports/repository/report.repository';
import { DEMO_REPORTS } from '@/shared/const/demo-reports.const';
import { toGeoPoint } from '@/shared/utils/geo';
import { computeHotScore } from '@/shared/utils/hot-score';
import { generateShortId } from '@/shared/utils/short-id';
import { slugify } from '@/shared/utils/slugify';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// Idempotent: each demo report is keyed by idempotencyKey, so re-seeding never duplicates
export async function seedDemoReportsService(authorId: string, now = new Date()): Promise<{ count: number }> {
  await Promise.all(
    DEMO_REPORTS.map((demo) => {
      const createdAt = new Date(now.getTime() - demo.hoursAgo * HOUR_MS);
      const fixedAt = demo.fixedHoursAgo !== undefined ? new Date(now.getTime() - demo.fixedHoursAgo * HOUR_MS) : undefined;
      return reportRepository.insertIfAbsent({
        shortId: generateShortId(),
        slug: slugify(demo.title),
        authorId: new mongoose.Types.ObjectId(authorId),
        title: demo.title,
        description: demo.description,
        categorySlug: demo.categorySlug,
        location: demo.location,
        locationMismatch: false,
        point: toGeoPoint(demo.centroid[0], demo.centroid[1]),
        images: [],
        status: demo.status,
        upvoteCount: demo.upvoteCount,
        hotScore: computeHotScore(demo.upvoteCount, createdAt),
        flagCount: 0,
        hidden: false,
        fixedAt,
        daysToFix: fixedAt ? Math.round((fixedAt.getTime() - createdAt.getTime()) / DAY_MS) : undefined,
        idempotencyKey: demo.key,
        createdAt,
        updatedAt: createdAt,
      });
    })
  );
  return { count: DEMO_REPORTS.length };
}
