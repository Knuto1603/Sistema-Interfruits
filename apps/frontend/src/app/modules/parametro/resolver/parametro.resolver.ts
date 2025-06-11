import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { Parametro } from '../interface/parametro.interface';
import { ParametroRepositoryService } from '../repository/parametro-repository.service';

export const parametroResolver: ResolveFn<Parametro> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
	const router: Router = inject(Router);
	const parametroService: ParametroRepositoryService = inject(ParametroRepositoryService);

	return parametroService.get(route.paramMap.get('id')).pipe(
		catchError((error) => {
			const parentUrl: string = state.url.split('/').slice(0, -1).join('/');
			router.navigateByUrl(parentUrl).then();

			return throwError(() => error);
		})
	);
};
