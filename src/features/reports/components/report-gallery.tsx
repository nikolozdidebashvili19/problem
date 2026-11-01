import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { ReportImage } from '@/features/reports/types/report.types';
import { cn } from '@/shared/lib/utils';

type ReportGalleryProps = {
  images: ReportImage[];
  title: string;
};

// First photo large, the rest as a row; fixed aspect ratios avoid layout shift (PRODUCT §16)
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
            'relative overflow-hidden rounded-md border border-border bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            index === 0 ? 'col-span-3 aspect-video' : 'aspect-square'
          )}
        >
          <Image
            src={image.url}
            alt={t('photoAlt', { index: index + 1, title })}
            fill
            unoptimized
            sizes={index === 0 ? '(min-width: 1024px) 720px, 100vw' : '240px'}
            className="object-cover"
            priority={index === 0}
          />
        </a>
      ))}
    </div>
  );
};
