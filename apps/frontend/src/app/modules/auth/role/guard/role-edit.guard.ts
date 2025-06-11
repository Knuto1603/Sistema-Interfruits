import { ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot } from '@angular/router';

import { RoleEditComponent } from '../component/edit/role-edit.component';

export const roleEditGuard: CanDeactivateFn<RoleEditComponent> = (
	component: RoleEditComponent,
	currentRoute: ActivatedRouteSnapshot,
	currentState: RouterStateSnapshot,
	nextState: RouterStateSnapshot
) => {
	let nextRoute: ActivatedRouteSnapshot = nextState.root;
	while (nextRoute.firstChild) {
		nextRoute = nextRoute.firstChild;
	}

	if (!nextState.url.includes('/role')) {
		return true;
	}

	if (nextRoute.paramMap.get('id')) {
		return true;
	}

	return component.closeDrawer().then(() => true);
};
