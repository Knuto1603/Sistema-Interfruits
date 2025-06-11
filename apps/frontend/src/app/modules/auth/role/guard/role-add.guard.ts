import { ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot } from '@angular/router';

import { RoleAddComponent } from '../component/add/role-add.component';

export const roleAddGuard: CanDeactivateFn<RoleAddComponent> = (
	component: RoleAddComponent,
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

	return component.closeDrawer().then(() => true);
};
