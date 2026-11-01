import { UserRole } from '@/features/auth/types/auth.types';
import { USER_ROLES } from '@/shared/const/roles.const';

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

// USER_ROLES is ordered from least to most privileged
export function hasRole(role: string, minRole: UserRole): boolean {
  if (!isUserRole(role)) return false;
  return USER_ROLES.indexOf(role) >= USER_ROLES.indexOf(minRole);
}
