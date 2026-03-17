import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Root redirect
  { path: '', redirectTo: 'generator', pathMatch: 'full' },

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
        loadComponent: () =>
          import('./features/auth/pages/auth-login.page').then(
            m => m.AuthLoginPage,
          ),
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('./features/auth/pages/auth-signup.page').then(
            m => m.AuthSignupPage,
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
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
          import('./features/generator/pages/generator.page').then(
            m => m.GeneratorPage,
          ),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/history/pages/history.page').then(
            m => m.HistoryPage,
          ),
      },
    ],
  },
];
