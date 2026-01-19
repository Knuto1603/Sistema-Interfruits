import {Routes} from "@angular/router";
import {FrutaListComponent} from "@modules/fruta/component/list/fruta-list.component";
import { FrutaAddComponent } from "./add/fruta-add.component";



export const FrutaRouting: Routes = [
  {
    path: '',
    component: FrutaListComponent,
  },
  {
    path:'add',
    component: FrutaAddComponent
  }
]
