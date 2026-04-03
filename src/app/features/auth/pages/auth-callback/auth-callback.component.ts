import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../../core/services/supabase.service';

@Component({
  standalone: true,
  selector: 'pf-auth-callback',
  templateUrl: './auth-callback.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCallbackComponent implements OnInit {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.supabase.client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this.router.navigate(['/generator']);
      }
    });
  }
}
