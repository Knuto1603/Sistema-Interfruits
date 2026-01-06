import { Routes } from '@angular/router';

import { productorResolver } from '../resolver/productor.resolver';

import { ProductorListComponent } from './list/productor-list.component';
import { ProductorAddComponent } from './add/productor-add.component';

export const ProductorRouting: Routes = [
  {
    path: '',
    component: ProductorListComponent,
  },
  {
    path:'add',
    component: ProductorAddComponent,
  }

];
