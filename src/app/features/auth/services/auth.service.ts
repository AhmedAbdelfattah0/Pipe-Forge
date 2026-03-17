import { Injectable, signal } from '@angular/core';

import { AuthUser } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _isLoggedIn = signal<boolean>(false);

  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly currentUser = signal<AuthUser | null>(null);

  login(email: string, password: string): void {
    // TODO: implement Supabase auth
    console.log('login', email, password);
    this._isLoggedIn.set(true);
  }

  signup(email: string, password: string): void {
    // TODO: implement Supabase auth
    console.log('signup', email, password);
  }

  logout(): void {
    this._isLoggedIn.set(false);
  }
}
