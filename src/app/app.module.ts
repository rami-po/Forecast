import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppComponent} from './app.component';
import {routing} from './app.routing';
import {SideListComponent} from './main/side-list/side-list.component';
import {MainComponent} from './main/main.component';
import {GridViewComponent} from './main/grid-view/grid-view.component';
import {EntryComponent} from './main/entry/entry.component';
import {HttpModule} from '@angular/http';
import {HeaderRowComponent} from './main/header-row/header-row.component';
import {MdButtonModule, MdDialogModule, MdToolbarModule, MdTooltipModule} from '@angular/material';
import {DatePipe} from '@angular/common';
import {ProjectComponent} from './project/project.component';
import {CompanyComponent} from './company/company.component';
import {ChartsModule} from 'ng2-charts';

import 'hammerjs';
// import 'chartjs-plugin-zoom';
import 'chartjs-plugin-annotation';
import {ProjectService} from './project/project.service';
import {MainService} from './main/main.service';
import {GraphComponent} from './project/graph/graph.component';
import {GraphService} from './project/graph/graph.service';
import {ChartModule} from 'angular2-chartjs';
import {MilestonePromptComponent} from './project/milestone-prompt/milestone-prompt.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    GridViewComponent,
    SideListComponent,
    EntryComponent,
    HeaderRowComponent,
    ProjectComponent,
    CompanyComponent,
    GraphComponent,
    MilestonePromptComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    MdTooltipModule,
    MdButtonModule,
    MdToolbarModule,
    MdDialogModule,
    ChartModule,
    routing],
  bootstrap: [AppComponent],
  entryComponents: [
    MilestonePromptComponent
  ],
  providers: [DatePipe, GraphService, MainService]
})
export class AppModule {

}
