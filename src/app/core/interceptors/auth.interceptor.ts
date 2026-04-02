import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { SupabaseService } from '../services/supabase.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const supabase = inject(SupabaseService);

  // Only attach the Authorization header for requests to our own API.
  // This prevents leaking the JWT to third-party domains.
  const isPipeForgeApi = req.url.startsWith(environment.apiUrl);
  if (!isPipeForgeApi) {
    return next(req);
  }

  return from(supabase.client.auth.getSession()).pipe(
    switchMap(({ data }) => {
      const session = data.session;
      if (session) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        return next(authReq);
      }
      return next(req);
    }),
  );
};
