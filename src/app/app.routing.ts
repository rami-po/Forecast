import {RouterModule, Routes} from '@angular/router';
import {ForecastComponent} from './forecast/forecast.component';
import {EntryComponent} from './forecast/entry/entry.component';
import {GridViewComponent} from './forecast/grid-view/grid-view.component';
import {SideListComponent} from './forecast/side-list/side-list.component';
import {CompanyComponent} from './company/company.component';
import {ProjectComponent} from './project/project.component';
import {BobComponent} from './bob/bob.component';
import {CapacityRowComponent} from './forecast/capacity-row/capacity-row.component';
import {NotFoundComponent} from "./not-found/not-found.component";
/**
 * Created by Rami Khadder on 7/17/2017.
 */

const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: '/all',
    pathMatch: 'full'
  },
  {
    path: 'forecast',
    component: ForecastComponent
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
  },
  {
    path: 'company',
    component: CompanyComponent
  },
  {
    path: 'all',
    component: ProjectComponent
  },
  {
    path: 'project/:id',
    component: ProjectComponent,
  },
  {
    path: 'client/:id',
    component: ProjectComponent,
  },
  {
    path: 'bob',
    component: BobComponent
  },
  {
    path: 'test',
    component: CapacityRowComponent
  },
  {
    path: '404',
    component: NotFoundComponent
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];

export const routing = RouterModule.forRoot(APP_ROUTES);
