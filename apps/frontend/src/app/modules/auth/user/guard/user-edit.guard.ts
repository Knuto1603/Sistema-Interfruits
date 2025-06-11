import { ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot } from '@angular/router';

import { UserEditComponent } from '../component/edit/user-edit.component';

export const userEditGuard: CanDeactivateFn<UserEditComponent> = (
  component: UserEditComponent,
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

  if (nextRoute.paramMap.get('id')) {
    return true;
  }

  return component.closeDrawer().then(() => true);
};
