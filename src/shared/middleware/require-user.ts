import { NextResponse } from 'next/server';

import { userRepository } from '@/features/auth/repository/user.repository';
import { UserDocument } from '@/features/auth/schema/user.schema';
import { UserRole } from '@/features/auth/types/auth.types';
import { getViewerId } from '@/shared/middleware/get-viewer';
import { hasRole } from '@/shared/utils/roles';

// Loads the user from DB on every call so bans and role changes apply immediately, not on next token refresh.
export async function requireUser(
  minRole: UserRole = 'citizen'
): Promise<{ user: UserDocument } | NextResponse> {
  const viewerId = await getViewerId();
  if (!viewerId) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }

  const user = await userRepository.findById(viewerId);
  if (!user || user.deletedAt) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
  if (user.status === 'banned') {
    return NextResponse.json({ error: 'BANNED' }, { status: 403 });
  }
  if (!hasRole(user.role, minRole)) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  return { user };
}
