import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { User } from '../interface/user.interface';
import { UserService } from '../repository/user.service';

export const userResolver: ResolveFn<User> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
	const router: Router = inject(Router);
	const userService: UserService = inject(UserService);

	return userService.get(route.paramMap.get('id')!).pipe(
		catchError((error) => {
			const parentUrl: string = state.url.split('/').slice(0, -1).join('/');
			router.navigateByUrl(parentUrl).then();

			return throwError(() => error);
		})
	);
};
