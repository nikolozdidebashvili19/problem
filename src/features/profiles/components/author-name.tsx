import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { ROUTES } from '@/shared/const/routes.const';

type AuthorNameProps = {
  authorId: string;
  // null when the author deleted their account: there is no profile to link to
  name: string | null;
};

export const AuthorName = ({ authorId, name }: AuthorNameProps) => {
  const t = useTranslations('report');

  if (!name) return <span>{t.rich('by', { name: t('deletedUser'), author: (chunks) => chunks })}</span>;

  return (
    <span>
      {t.rich('by', {
        name,
        author: (chunks) => (
          <Link
            href={ROUTES.profile(authorId)}
            className="rounded-sm font-medium outline-none hover:text-link focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {chunks}
          </Link>
        ),
      })}
    </span>
  );
};
