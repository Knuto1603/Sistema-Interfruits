import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of, switchMap } from 'rxjs';

export const authCheck: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
): Observable<boolean | UrlTree> => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  return authService.check().pipe(
    switchMap((authenticated) => {
      if (!authenticated) {
        // Redirect to the sign-in page with a redirectUrl param
        const redirectURL = `/${segments.join('/')}`;
        const urlTree = router.parseUrl(`sign-in?redirectURL=${redirectURL}`);

        return of(urlTree);
      }

      return of(true);
    })
  );
};

export const noAuthCheck: CanMatchFn = () => {
  const authService: AuthService = inject(AuthService);

  return authService.check().pipe(switchMap((authenticated) => of(!authenticated)));
};
