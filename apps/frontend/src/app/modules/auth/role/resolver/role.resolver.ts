import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { Role } from '../interface/role.interface';
import { RoleService } from '../repository/role.service';

export const roleResolver: ResolveFn<Role> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
	const router: Router = inject(Router);
	const roleService: RoleService = inject(RoleService);

	return roleService.get(route.paramMap.get('id')!).pipe(
		catchError((error) => {
			const parentUrl: string = state.url.split('/').slice(0, -1).join('/');
			router.navigateByUrl(parentUrl).then();

			return throwError(() => error);
		})
	);
};
