export interface AuthUser {
  id: string;
  name: string;
  email: string;
  departmentId: string | null;
  roleId: string;
  isActive: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionUser extends AuthUser {
  roleName: string | null;
  permissions: string[];
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  permissions: string[];
  roleName: string;
}

export interface MeResponse {
  user: AuthUser;
  roleName: string | null;
  permissions: string[];
}
