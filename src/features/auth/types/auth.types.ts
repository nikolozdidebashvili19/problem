import { LOCALES, USER_ROLES, USER_STATUSES } from '@/shared/const/roles.const';

export type UserRole = (typeof USER_ROLES)[number];

export type UserStatus = (typeof USER_STATUSES)[number];

export type Locale = (typeof LOCALES)[number];

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

export type AuthActions = {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export type AuthStore = AuthState & AuthActions;
export type AuthStoreType = AuthStore;
