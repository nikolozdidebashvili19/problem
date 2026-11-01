import { userRepository } from '@/features/auth/repository/user.repository';
import { UserDocument } from '@/features/auth/schema/user.schema';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string };

const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

// Session user id for personalising public responses (e.g. "you voted"); undefined for guests
export async function getViewerId(): Promise<string | undefined> {
  const session = await auth();
  const id = (session?.user as SessionUser | undefined)?.id;
  return id && OBJECT_ID_PATTERN.test(id) ? id : undefined;
}

// Fresh DB user for public pages that adapt to the viewer (owner actions, delete rights); null for guests
export async function getViewer(): Promise<UserDocument | null> {
  const id = await getViewerId();
  if (!id) return null;
  const user = await userRepository.findById(id);
  return user && !user.deletedAt ? user : null;
}
