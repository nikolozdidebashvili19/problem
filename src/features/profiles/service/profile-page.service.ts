import { cache } from 'react';

import { getProfileService } from '@/features/profiles/service/profile.service';

// One load per request, shared by the page and generateMetadata
export const loadProfilePageService = cache(getProfileService);
