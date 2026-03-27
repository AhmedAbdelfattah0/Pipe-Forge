import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { SupabaseService } from '../services/supabase.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const supabase = inject(SupabaseService);

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
