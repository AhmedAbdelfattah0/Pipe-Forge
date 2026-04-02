import { inject, Injectable, signal } from '@angular/core';
import { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from '../../../core/services/supabase.service';
import { AuthUser } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);

  private readonly _isLoggedIn = signal<boolean>(false);
  private readonly _currentUser = signal<AuthUser | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    // Initialize from existing session
    this.supabase.client.auth.getSession().then(({ data }) => {
      this.applySession(data.session);
    });

    // Keep signals in sync with Supabase auth state changes
    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.applySession(session);
    });
  }

  async login(email: string, password: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    const { error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      // Generic message to prevent email enumeration attacks
      this._error.set('Invalid email or password.');
    }
    this._loading.set(false);
  }

  async signup(email: string, password: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    const { error } = await this.supabase.client.auth.signUp({
      email,
      password,
    });
    if (error) {
      // Generic message to prevent email enumeration attacks
      this._error.set('Unable to create account. Please try again or use a different email.');
    }
    this._loading.set(false);
  }

  async logout(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    const { error } = await this.supabase.client.auth.signOut();
    if (error) {
      this._error.set(error.message);
    }
    this._loading.set(false);
  }

  async signInWithGoogle(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    const { error } = await this.supabase.client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/generator' },
    });
    if (error) {
      this._error.set(error.message);
    }
    this._loading.set(false);
  }

  async getSession(): Promise<Session | null> {
    const { data } = await this.supabase.client.auth.getSession();
    return data.session;
  }

  private applySession(session: Session | null): void {
    if (session) {
      this._isLoggedIn.set(true);
      this._currentUser.set(this.mapUser(session.user));
    } else {
      this._isLoggedIn.set(false);
      this._currentUser.set(null);
    }
  }

  private mapUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email ?? '',
      displayName: user.user_metadata?.['full_name'] as string | undefined,
    };
  }
}
