import { userRepository } from '@/features/auth/repository/user.repository';
import { categoryRepository } from '@/features/categories/repository/category.repository';
import { locationRepository } from '@/features/locations/repository/location.repository';
import { ReportDocument } from '@/features/reports/schema/report.schema';
import { ReportCard, ReportCardLocation, ReportStatus } from '@/features/reports/types/report.types';
import { voteRepository } from '@/features/votes/repository/vote.repository';
import { FEED_EXCERPT_LENGTH } from '@/shared/const/feed.const';
import { VOTABLE_STATUSES } from '@/shared/const/report-status.const';
import { truncate } from '@/shared/utils/format';

const unique = (values: string[]) => [...new Set(values)];

export function isVotableStatus(status: string): boolean {
  return (VOTABLE_STATUSES as readonly string[]).includes(status);
}

function locationSlugs(report: ReportDocument): string[] {
  const { neighborhood, municipality, region } = report.location ?? {};
  return [neighborhood, municipality, region].filter((slug): slug is string => Boolean(slug));
}

// Batch-loads categories, locations, authors and the viewer's votes: 4 queries per page, never per card
export async function buildReportCards(reports: ReportDocument[], viewerId?: string): Promise<ReportCard[]> {
  if (reports.length === 0) return [];

  const [categories, locations, authors, votes] = await Promise.all([
    categoryRepository.findBySlugs(unique(reports.map((report) => report.categorySlug))),
    locationRepository.findBySlugs(unique(reports.flatMap(locationSlugs))),
    userRepository.findPublicByIds(unique(reports.map((report) => report.authorId.toString()))),
    viewerId
      ? voteRepository.findByUserAndReports(viewerId, reports.map((report) => report._id.toString()))
      : Promise.resolve([]),
  ]);

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
  const locationBySlug = new Map(locations.map((location) => [location.slug, location]));
  const authorById = new Map(authors.map((author) => [author._id.toString(), author]));
  const votedReportIds = new Set(votes.map((vote) => vote.reportId.toString()));

  return reports.map((report) => {
    const category = categoryBySlug.get(report.categorySlug);
    const author = authorById.get(report.authorId.toString());
    const firstImage = report.images[0];
    const isOwn = viewerId === report.authorId.toString();

    return {
      id: report._id.toString(),
      shortId: report.shortId,
      slug: report.slug,
      title: report.title,
      excerpt: truncate(report.description, FEED_EXCERPT_LENGTH),
      image: firstImage ? { url: firstImage.url, width: firstImage.width, height: firstImage.height } : null,
      imageCount: report.images.length,
      category: category
        ? { slug: category.slug, nameKa: category.nameKa, nameEn: category.nameEn, icon: category.icon }
        : null,
      locations: locationSlugs(report)
        .map((slug) => locationBySlug.get(slug))
        .filter((location) => location !== undefined)
        .map((location): ReportCardLocation => ({
          slug: location.slug,
          nameKa: location.nameKa,
          nameEn: location.nameEn,
        })),
      status: report.status as ReportStatus,
      upvoteCount: report.upvoteCount,
      commentCount: report.commentCount ?? 0,
      hasVoted: votedReportIds.has(report._id.toString()),
      canVote: isVotableStatus(report.status) && !isOwn,
      // null = deleted account; the UI renders a localized placeholder
      authorName: !author || author.deletedAt ? null : author.displayName || author.name,
      createdAt: report.createdAt.toISOString(),
      fixedAt: report.fixedAt ? report.fixedAt.toISOString() : null,
    };
  });
}
