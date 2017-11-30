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
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule,
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
import {StatusMessageDialogComponent} from './forecast/status-message/status-message.component';
import {RollUpService} from './forecast/roll-up/roll-up.service';
import {FakeEmployeeComponent} from './forecast/side-list/fake-employee/fake-employee.component';
import {NotFoundComponent} from './not-found/not-found.component';
import {FunnelComponent} from './funnel/funnel.component';
import {TableComponent} from './funnel/table/table.component';
import {AddFunnelItemComponent} from './funnel/add-funnel-item/add-funnel-item.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SideListProjectsComponent} from './forecast/side-list-projects/side-list-projects.component';
import {PersonnelComponent} from './personnel/personnel.component';
import {MainNavComponent} from './main-nav/main-nav.component';
import {FunnelService} from './funnel/funnel.service';
import {FileSelectDirective} from 'ng2-file-upload';
import {CdkTableModule} from "@angular/cdk/table";
import { PersonnelClientComponent } from './personnel-client/personnel-client.component';

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
    FakeEmployeeComponent,
    FunnelComponent,
    TableComponent,
    AddFunnelItemComponent,
    SideListProjectsComponent,
    PersonnelComponent,
    MainNavComponent,
    FileSelectDirective,
    PersonnelClientComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpModule,
    CdkTableModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    ChartModule,
    routing],
  bootstrap: [AppComponent],
  entryComponents: [
    MilestonePromptComponent,
    StatusMessageDialogComponent,
    FakeEmployeeComponent,
    AddFunnelItemComponent
  ],
  providers: [DatePipe, GraphService, ForecastService, RollUpService]
})
export class AppModule {

}
