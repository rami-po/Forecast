import {RouterModule, Routes} from '@angular/router';
import {MainComponent} from "./main/main.component";
import {EntryComponent} from "./main/entry/entry.component";
import {GridViewComponent} from "./main/grid-view/grid-view.component";
import {SideListComponent} from "./main/side-list/side-list.component";
/**
 * Created by Rami Khadder on 7/17/2017.
 */
const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/main',
    pathMatch: 'full'
  },
  {
    path: 'main',
    component: MainComponent
  },
  {
    path: 'entry',
    component: EntryComponent
  },
  {
    path: 'grid',
    component: GridViewComponent
  },
  {
    path: 'side',
    component: SideListComponent
  }
];

export const routing = RouterModule.forRoot(APP_ROUTES);
