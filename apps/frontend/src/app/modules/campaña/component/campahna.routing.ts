import { Routes } from '@angular/router';

import { CampanhaAddComponent } from './add/campahna-add.component';
import { CampanhaEditComponent } from './edit/campahna-edit.component';
import { CampanhaListComponent } from './list/campahna-list.component';

export const CampanhaRouting: Routes = [
  {
    path: '',
    component: CampanhaListComponent,
  },
  {
    path: 'add',
    component: CampanhaAddComponent,
  },
  {
    path: ':id',
    component: CampanhaEditComponent,
  },
];
