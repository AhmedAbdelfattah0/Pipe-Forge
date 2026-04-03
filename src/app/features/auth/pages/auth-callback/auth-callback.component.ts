import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'pf-auth-callback',
  templateUrl: './auth-callback.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCallbackComponent implements OnInit {
  // Inject AuthService to ensure it is initialized (its constructor registers
  // the onAuthStateChange listener that processes the OAuth token from the URL).
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // AuthService constructor already handles onAuthStateChange.
    // Wait for the session to be applied, then navigate.
    setTimeout(() => {
      this.router.navigate(['/generator']);
    }, 2000);
  }
}
