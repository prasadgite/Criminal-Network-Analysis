import { SetMetadata } from '@nestjs/common';
import type { Permission } from '../authorization/permissions';
export const PERMISSIONS_KEY='sandhaan_permissions';
export const RequirePermissions=(...permissions:Permission[])=>SetMetadata(PERMISSIONS_KEY,permissions);
