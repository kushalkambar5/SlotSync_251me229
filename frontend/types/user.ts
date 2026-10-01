export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  departmentId: string | null;
  roleId: string;
  roleName?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  isSystemRole: boolean;
  isActive: boolean;
}

export interface RoleDetail extends Role {
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description?: string | null;
  resource?: string;
  action?: string;
}
