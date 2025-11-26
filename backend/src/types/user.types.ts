export interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithPassword extends User {
  password_hash: string;
  failed_login_attempts: number;
  account_locked_until: Date | null;
  is_admin: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthToken {
  token: string;
  user: User;
}

export interface JWTPayload {
  userId: string;
  email: string;
}
