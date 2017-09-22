import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppComponent} from './app.component';
import {routing} from './app.routing';
import {SideListComponent} from './forecast/side-list/side-list.component';
import {ForecastComponent} from './forecast/forecast.component';
import {GridViewComponent} from './forecast/grid-view/grid-view.component';
import {EntryComponent} from './forecast/entry/entry.component';
import {HttpModule} from '@angular/http';
import {HeaderRowComponent} from './forecast/header-row/header-row.component';
import {
  MdButtonModule, MdCheckboxModule, MdDialogModule, MdIconModule, MdInputModule, MdMenuModule, MdProgressSpinnerModule,
  MdToolbarModule,
  MdTooltipModule
} from '@angular/material';
import {DatePipe} from '@angular/common';
import {ProjectComponent} from './project/project.component';
import {CompanyComponent} from './company/company.component';
import {ChartsModule} from 'ng2-charts';

import 'hammerjs';
// import 'chartjs-plugin-zoom';
import 'chartjs-plugin-annotation';
import {ProjectService} from './project/project.service';
import {ForecastService} from './forecast/forecast.service';
import {GraphComponent} from './project/graph/graph.component';
import {GraphService} from './project/graph/graph.service';
import {ChartModule} from 'angular2-chartjs';
import {MilestonePromptComponent} from './project/milestone-prompt/milestone-prompt.component';
import {RollUpComponent} from './forecast/roll-up/roll-up.component';
import {BobComponent} from './bob/bob.component';
import {ClientListComponent} from './bob/client-list/client-list.component';
import {CapacityRowComponent} from './forecast/capacity-row/capacity-row.component';
import {StatusMessageDialogComponent} from "./forecast/status-message/status-message.component";
import {RollUpService} from "./forecast/roll-up/roll-up.service";
import {FakeEmployeeComponent} from "./forecast/side-list/fake-employee/fake-employee.component";
import {NotFoundComponent} from "./not-found/not-found.component";

@NgModule({
  declarations: [
    AppComponent,
    ForecastComponent,
    GridViewComponent,
    SideListComponent,
    EntryComponent,
    HeaderRowComponent,
    ProjectComponent,
    CompanyComponent,
    GraphComponent,
    NotFoundComponent,
    MilestonePromptComponent,
    RollUpComponent,
    BobComponent,
    ClientListComponent,
    CapacityRowComponent,
    StatusMessageDialogComponent,
    FakeEmployeeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    MdTooltipModule,
    MdButtonModule,
    MdToolbarModule,
    MdDialogModule,
    MdMenuModule,
    MdProgressSpinnerModule,
    MdIconModule,
    MdInputModule,
    MdCheckboxModule,
    ChartModule,
    routing],
  bootstrap: [AppComponent],
  entryComponents: [
    MilestonePromptComponent,
    StatusMessageDialogComponent,
    FakeEmployeeComponent
  ],
  providers: [DatePipe, GraphService, ForecastService, RollUpService]
})
export class AppModule {

}
