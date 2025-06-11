import { Routes } from '@angular/router';

import { parametroResolver } from '../resolver/parametro.resolver';
import { ParametroAddComponent } from './add/parametro-add.component';
import { ParametroEditComponent } from './edit/parametro-edit.component';
import { ParametroListComponent } from './list/parametro-list.component';

export const ParametroRouting: Routes = [
	{
		path: '',
		component: ParametroListComponent,
	},
	{
		path: 'add',
		component: ParametroAddComponent,
	},
	{
		path: ':id',
		component: ParametroEditComponent,
		resolve: {
			parametro: parametroResolver,
		},
	},
];
