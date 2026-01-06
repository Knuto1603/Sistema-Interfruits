import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { Productor } from '../interface/productor.interface';
import { ProductorRepositoryService } from '../repository/productor-repository.service';

export const productorResolver: ResolveFn<Productor> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router: Router = inject(Router);
  const productorService: ProductorRepositoryService = inject(ProductorRepositoryService);

  return productorService.get(route.paramMap.get('id')).pipe(
    catchError((error) => {
      const parentUrl: string = state.url.split('/').slice(0, -1).join('/');
      router.navigateByUrl(parentUrl).then();

      return throwError(() => error);
    })
  );
};
