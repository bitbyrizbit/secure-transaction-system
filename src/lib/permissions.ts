import { RoleName } from "@prisma/client";

export const PERMISSIONS = {
  ADMIN: [
    "view_organization_users",
    "view_organization_transactions",
    "create_transactions",
    "update_transactions",
    "view_audit_logs",
  ],
  MEMBER: [
    "view_permitted_transactions",
    "create_transactions",
    "update_own_transactions",
  ],
  GUEST: [
    "view_public_data"
  ]
} as const;

export type Permission = 
  | typeof PERMISSIONS.ADMIN[number] 
  | typeof PERMISSIONS.MEMBER[number] 
  | typeof PERMISSIONS.GUEST[number];

export function hasPermission(role: RoleName, permission: Permission): boolean {
  if (role === "ADMIN") return true;
  
  const rolePermissions = PERMISSIONS[role] as readonly string[];
  return rolePermissions.includes(permission);
}
