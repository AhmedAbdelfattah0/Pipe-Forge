import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { AuthService } from './features/auth/services/auth.service';

// Layouts
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { AdminLayoutComponent } from './core/layouts/admin-layout/admin-layout.component';
import { AppLayoutComponent } from './core/layouts/app-layout/app-layout.component';

// Landing + Billing
import { LandingPage } from './features/landing/pages/landing.page';
import { PricingPage } from './features/billing/pages/pricing.page';

// Auth pages
import { AuthLoginPage } from './features/auth/pages/auth-login.page';
import { AuthSignupPage } from './features/auth/pages/auth-signup.page';
import { AuthCallbackComponent } from './features/auth/pages/auth-callback/auth-callback.component';

// Admin pages
import { AdminOverviewPage } from './features/admin/pages/admin-overview.page';
import { AdminUsersPage } from './features/admin/pages/admin-users.page';
import { AdminPricingPage } from './features/admin/pages/admin-pricing.page';
import { AdminCompensationPage } from './features/admin/pages/admin-compensation.page';
import { AdminCouponsPage } from './features/admin/pages/admin-coupons.page';
import { AdminFeedbackPage } from './features/admin/pages/admin-feedback.page';
import { AdminGenerationsPage } from './features/admin/pages/admin-generations.page';
import { AdminSystemPage } from './features/admin/pages/admin-system.page';
import { AdminErrorsPage } from './features/admin/pages/admin-errors/admin-errors.page';

// App pages
import { GeneratorSelectionPage } from './features/generator-selection/pages/generator-selection.page';
import { GeneratorPage } from './features/generator/pages/generator.page';
import { BackendGeneratorRootPage } from './features/generator-backend/pages/backend-generator-root.page';
import { MobileGeneratorRootPage } from './features/generator-mobile/pages/mobile-generator-root.page';
import { HistoryPage } from './features/history/pages/history.page';
import { ValidatorPage } from './features/validator/pages/validator.page';
import { ProfilePage } from './features/profile/pages/profile.page';

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
    component: LandingPage,
  },

  // Pricing page — public, no auth required
  {
    path: 'pricing',
    component: PricingPage,
  },

  // Auth routes — centered layout, no sidebar
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        canActivate: [landingGuard],
        component: AuthLoginPage,
      },
      {
        path: 'signup',
        canActivate: [landingGuard],
        component: AuthSignupPage,
      },
      {
        path: 'callback',
        component: AuthCallbackComponent,
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // Admin routes — separate dark layout, admin guard
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: AdminOverviewPage,
      },
      {
        path: 'users',
        component: AdminUsersPage,
      },
      {
        path: 'pricing',
        component: AdminPricingPage,
      },
      {
        path: 'compensation',
        component: AdminCompensationPage,
      },
      {
        path: 'coupons',
        component: AdminCouponsPage,
      },
      {
        path: 'feedback',
        component: AdminFeedbackPage,
      },
      {
        path: 'generations',
        component: AdminGenerationsPage,
      },
      {
        path: 'system',
        component: AdminSystemPage,
      },
      {
        path: 'errors',
        component: AdminErrorsPage,
      },
    ],
  },

  // App routes — sidebar layout, protected by auth guard
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'generator',
        component: GeneratorSelectionPage,
      },
      {
        path: 'generator/frontend',
        component: GeneratorPage,
      },
      {
        path: 'generator/backend',
        component: BackendGeneratorRootPage,
      },
      {
        path: 'generator/mobile',
        component: MobileGeneratorRootPage,
      },
      {
        path: 'history',
        component: HistoryPage,
      },
      {
        path: 'validator',
        component: ValidatorPage,
      },
      {
        path: 'profile',
        component: ProfilePage,
      },
    ],
  },
];
