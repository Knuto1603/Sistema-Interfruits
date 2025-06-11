
import { ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot } from '@angular/router';

import { UserAddComponent } from '../component/add/user-add.component';

export const userAddGuard: CanDeactivateFn<UserAddComponent> = (
  component: UserAddComponent,
  currentRoute: ActivatedRouteSnapshot,
  currentState: RouterStateSnapshot,
  nextState: RouterStateSnapshot
) => {
  let nextRoute: ActivatedRouteSnapshot = nextState.root;
  while (nextRoute.firstChild) {
    nextRoute = nextRoute.firstChild;
  }

  if (!nextState.url.includes('/user')) {
    return true;
  }

  return component.closeDrawer().then(() => true);
};
