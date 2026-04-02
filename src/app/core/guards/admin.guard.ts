import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminService } from '../../features/admin/services/admin.service';

export const adminGuard: CanActivateFn = async () => {
  const adminService = inject(AdminService);
  const router = inject(Router);

  const isAdmin = await adminService.checkAdminAccess();
  if (isAdmin) {
    return true;
  }
  return router.createUrlTree(['/generator']);
};
