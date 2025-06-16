import { Routes } from '@angular/router';
import { DefaultLayoutComponent, EmptyLayoutComponent  } from './layout';

import { AuthGuard } from '@core/auth/guards/auth.guard';
import { NoAuthGuard } from '@core/auth/guards/noAuth.guard';
import {RoleCheckType, RoleConfig, RoleGuard} from "@core/auth/guards/role.guard";

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'dashboard' },

  // Auth routes for guests
  {
    path: '',
    canActivate: [NoAuthGuard],
    canActivateChild: [NoAuthGuard],
    component: EmptyLayoutComponent,
    data: {
      title: 'Sign In',
    },
    children: [{
      path: 'sign-in',
      loadChildren: () => import('./modules/auth/sign-in/sign-in.routes').then(m => m.routes)

    }],
  },

  // Auth routes for authenticated users
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: EmptyLayoutComponent,
    data: {
      title: 'Sign Out',
    },
    children: [{
      path: 'sign-out',
      loadChildren: () => import('./modules/auth/sign-out/sign-out.routes')
    }],
  },


  {
    path: '',
    canActivate: [AuthGuard, RoleGuard],
    canActivateChild: [AuthGuard],
    component: DefaultLayoutComponent,
    data: {
      title: 'home',
      data: {
        roleConfig: {
          roles: ['ROLE_USER', 'ROLE_ADMIN','KNUTO_ROLE'],
          checkType: RoleCheckType.ANY,
          redirectTo: ''
        } as RoleConfig
      }
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes)
      },
      {
        path: 'security',
        canActivate: [RoleGuard],
        data: {
          roleConfig: {
            roles: ['ROLE_ADMIN','KNUTO_ROLE'],
            checkType: RoleCheckType.ALL,
            redirectTo: ''
          } as RoleConfig
        },
        children: [
          {
            path: 'user',
            title: 'Usuarios',
            loadChildren: () => import('./modules/auth/user/component/user.routing').then((m) => m.UserRouting),
          },
          {
            path: 'role',
            title: 'Roles de Usuario',
            loadChildren: () => import('./modules/auth/role/component/role.routing').then((c) => c.RoleRouting),
          },
        ],
      },
      {
        path: 'parametro',
        loadChildren: () => import('./modules/parametro/component/parametro.routing').then((m) => m.ParametroRouting)
      },
      {
        path: 'theme',
        loadChildren: () => import('./views/theme/routes').then((m) => m.routes)
      },
      {
        path: 'base',
        loadChildren: () => import('./views/base/routes').then((m) => m.routes)
      },
      {
        path: 'buttons',
        loadChildren: () => import('./views/buttons/routes').then((m) => m.routes)
      },
      {
        path: 'forms',
        loadChildren: () => import('./views/forms/routes').then((m) => m.routes)
      },
      {
        path: 'icons',
        loadChildren: () => import('./views/icons/routes').then((m) => m.routes)
      },
      {
        path: 'notifications',
        loadChildren: () => import('./views/notifications/routes').then((m) => m.routes)
      },
      {
        path: 'widgets',
        loadChildren: () => import('./views/widgets/routes').then((m) => m.routes)
      },
      {
        path: 'charts',
        loadChildren: () => import('./views/charts/routes').then((m) => m.routes)
      },
      {
        path: 'pages',
        loadChildren: () => import('./views/pages/routes').then((m) => m.routes)
      }
    ]
  },
  {
    path: '404',
    loadComponent: () => import('./views/pages/page404/page404.component').then(m => m.Page404Component),
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    loadComponent: () => import('./views/pages/page500/page500.component').then(m => m.Page500Component),
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    loadComponent: () => import('./views/pages/login/login.component').then(m => m.LoginComponent),
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    loadComponent: () => import('./views/pages/register/register.component').then(m => m.RegisterComponent),
    data: {
      title: 'Register Page'
    }
  },
  { path: '**', redirectTo: 'dashboard' }
];
