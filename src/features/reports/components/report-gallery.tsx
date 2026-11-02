import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { ReportImage } from '@/features/reports/types/report.types';
import { cn } from '@/shared/lib/utils';

type ReportGalleryProps = {
  images: ReportImage[];
  title: string;
};

// First photo large at its own proportions, the rest as a row; never cropped, since photos are evidence.
// Stored dimensions / fixed aspect ratios avoid layout shift (PRODUCT §16)
export const ReportGallery = ({ images, title }: ReportGalleryProps) => {
  const t = useTranslations('reportPage');
  if (images.length === 0) return null;

  return (
    <div className={cn('grid gap-2', images.length > 1 && 'grid-cols-3')}>
      {images.map((image, index) => (
        <a
          key={image.publicId}
          href={image.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'overflow-hidden rounded-md border border-border bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            index === 0 ? 'col-span-3' : 'relative aspect-square'
          )}
        >
          {index === 0 ? (
            <Image
              src={image.url}
              alt={t('photoAlt', { index: index + 1, title })}
              width={image.width}
              height={image.height}
              unoptimized
              sizes="(min-width: 1024px) 720px, 100vw"
              className="h-auto max-h-screen w-full object-contain"
              priority
            />
          ) : (
            <Image
              src={image.url}
              alt={t('photoAlt', { index: index + 1, title })}
              fill
              unoptimized
              sizes="240px"
              className="object-contain"
            />
          )}
        </a>
      ))}
    </div>
  );
};
