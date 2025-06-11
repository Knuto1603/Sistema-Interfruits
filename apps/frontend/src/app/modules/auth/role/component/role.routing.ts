import { Routes } from '@angular/router';

import { roleAddGuard } from '../guard/role-add.guard';
import { roleEditGuard } from '../guard/role-edit.guard';
import { roleResolver } from '../resolver/role.resolver';
import { RoleAddComponent } from './add/role-add.component';
import { RoleEditComponent } from './edit/role-edit.component';
import { RoleListComponent } from './list/role-list.component';

export const RoleRouting: Routes = [
	{
		path: '',
		component: RoleListComponent,
		children: [
			{
				path: 'add',
				component: RoleAddComponent,
				canDeactivate: [roleAddGuard],
			},
			{
				path: ':id',
				component: RoleEditComponent,
				canDeactivate: [roleEditGuard],
				resolve: {
					role: roleResolver,
				},
			},
		],
	},
];
