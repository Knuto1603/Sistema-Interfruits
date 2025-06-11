import { Routes } from '@angular/router';

import { userAddGuard } from '../guard/user-add.guard';
import { userEditGuard } from '../guard/user-edit.guard';
import { userResolver } from '../resolver/user.resolver';
import { UserAddComponent } from './add/user-add.component';
import { UserEditComponent } from './edit/user-edit.component';
import { UserListComponent } from './list/user-list.component';

export const UserRouting: Routes = [
	{
		path: '',
		component: UserListComponent,
		children: [
			{
				path: 'add',
				component: UserAddComponent,
				canDeactivate: [userAddGuard],
			},
			{
				path: ':id',
				component: UserEditComponent,
				canDeactivate: [userEditGuard],
				resolve: {
					user: userResolver,
				},
			},
		],
	},
];
