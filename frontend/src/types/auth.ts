export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  sessionToken: string | null;
  isLoading: boolean;
}
