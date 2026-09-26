export const PERMISSIONS = {
  DASHBOARD_VIEW:'dashboard:view', CASES_VIEW:'cases:view', CASES_MANAGE:'cases:manage',
  ENTITIES_VIEW:'entities:view', NETWORK_VIEW:'network:view', TIMELINE_VIEW:'timeline:view',
  LOCATIONS_VIEW:'locations:view', FINDINGS_VIEW:'findings:view', EVIDENCE_VIEW:'evidence:view',
  EVIDENCE_MANAGE:'evidence:manage', ACCESS_REVIEW:'access:review', USERS_MANAGE:'users:manage',
  AUDIT_VIEW:'audit:view', PROFILE_VIEW:'profile:view',
} as const;
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type SandhaanRole = 'investigator'|'supervisor'|'analyst'|'administrator';
export const ROLE_PERMISSIONS: Record<SandhaanRole, readonly Permission[]> = {
 investigator:['dashboard:view','cases:view','entities:view','network:view','timeline:view','locations:view','findings:view','evidence:view','profile:view'],
 supervisor:['dashboard:view','cases:view','cases:manage','entities:view','network:view','timeline:view','locations:view','findings:view','evidence:view','evidence:manage','audit:view','profile:view'],
 analyst:['dashboard:view','cases:view','entities:view','network:view','timeline:view','locations:view','findings:view','evidence:view','profile:view'],
 administrator:Object.values(PERMISSIONS),
};
export function hasPermission(role: string | undefined, p: Permission) {
  if (!role) return false;
  const normalized = role.toLowerCase().trim();
  const effectiveRole: SandhaanRole =
    normalized === 'cyber_cell_admin' || normalized === 'admin'
      ? 'administrator'
      : (normalized as SandhaanRole);
  return ROLE_PERMISSIONS[effectiveRole]?.includes(p) ?? false;
}
