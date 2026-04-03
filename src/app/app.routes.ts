import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { AuthService } from './features/auth/services/auth.service';

/**
 * Landing guard: authenticated users are redirected to /generator;
 * unauthenticated users see the landing page.
 */
const landingGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const session = await auth.getSession();
  if (session) {
    return router.createUrlTree(['/generator']);
  }
  return true;
};

export const routes: Routes = [
  // Landing page — public, accessible to all users including authenticated ones
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/landing/pages/landing.page').then(
        m => m.LandingPage,
      ),
  },

  // Pricing page — public, no auth required
  {
    path: 'pricing',
    loadComponent: () =>
      import('./features/billing/pages/pricing.page').then(
        m => m.PricingPage,
      ),
  },

  // Auth routes — centered layout, no sidebar
  {
    path: 'auth',
    loadComponent: () =>
      import('./core/layouts/auth-layout/auth-layout.component').then(
        m => m.AuthLayoutComponent,
      ),
    children: [
      {
        path: 'login',
        canActivate: [landingGuard],
        loadComponent: () =>
          import('./features/auth/pages/auth-login.page').then(
            m => m.AuthLoginPage,
          ),
      },
      {
        path: 'signup',
        canActivate: [landingGuard],
        loadComponent: () =>
          import('./features/auth/pages/auth-signup.page').then(
            m => m.AuthSignupPage,
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // Admin routes — separate dark layout, admin guard
  {
    path: 'admin',
    loadComponent: () =>
      import('./core/layouts/admin-layout/admin-layout.component').then(
        m => m.AdminLayoutComponent,
      ),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/admin/pages/admin-overview.page').then(
            m => m.AdminOverviewPage,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/pages/admin-users.page').then(
            m => m.AdminUsersPage,
          ),
      },
      {
        path: 'pricing',
        loadComponent: () =>
          import('./features/admin/pages/admin-pricing.page').then(
            m => m.AdminPricingPage,
          ),
      },
      {
        path: 'compensation',
        loadComponent: () =>
          import('./features/admin/pages/admin-compensation.page').then(
            m => m.AdminCompensationPage,
          ),
      },
      {
        path: 'coupons',
        loadComponent: () =>
          import('./features/admin/pages/admin-coupons.page').then(
            m => m.AdminCouponsPage,
          ),
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import('./features/admin/pages/admin-feedback.page').then(
            m => m.AdminFeedbackPage,
          ),
      },
      {
        path: 'generations',
        loadComponent: () =>
          import('./features/admin/pages/admin-generations.page').then(
            m => m.AdminGenerationsPage,
          ),
      },
      {
        path: 'system',
        loadComponent: () =>
          import('./features/admin/pages/admin-system.page').then(
            m => m.AdminSystemPage,
          ),
      },
      {
        path: 'errors',
        loadComponent: () =>
          import('./features/admin/pages/admin-errors/admin-errors.page').then(
            m => m.AdminErrorsPage,
          ),
      },
    ],
  },

  // App routes — sidebar layout, protected by auth guard
  {
    path: '',
    loadComponent: () =>
      import('./core/layouts/app-layout/app-layout.component').then(
        m => m.AppLayoutComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'generator',
        loadComponent: () =>
          import('./features/generator-selection/pages/generator-selection.page').then(
            m => m.GeneratorSelectionPage,
          ),
      },
      {
        path: 'generator/frontend',
        loadComponent: () =>
          import('./features/generator/pages/generator.page').then(
            m => m.GeneratorPage,
          ),
      },
      {
        path: 'generator/backend',
        loadComponent: () =>
          import('./features/generator-backend/pages/backend-generator-root.page').then(
            m => m.BackendGeneratorRootPage,
          ),
      },
      {
        path: 'generator/mobile',
        loadComponent: () =>
          import('./features/generator-mobile/pages/mobile-generator-root.page').then(
            m => m.MobileGeneratorRootPage,
          ),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/history/pages/history.page').then(
            m => m.HistoryPage,
          ),
      },
      {
        path: 'validator',
        loadComponent: () =>
          import('./features/validator/pages/validator.page').then(
            m => m.ValidatorPage,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/pages/profile.page').then(
            m => m.ProfilePage,
          ),
      },
    ],
  },
];
