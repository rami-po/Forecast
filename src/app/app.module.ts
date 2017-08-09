import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import 'hammerjs';
import { AppComponent } from './app.component';
import {routing} from './app.routing';
import {SideListComponent} from './main/side-list/side-list.component';
import {MainComponent} from './main/main.component';
import {GridViewComponent} from './main/grid-view/grid-view.component';
import {EntryComponent} from './main/entry/entry.component';
import {MainService} from "./main/main.service";
import {HttpModule} from "@angular/http";
@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    GridViewComponent,
    SideListComponent,
    EntryComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    HttpModule,
    routing],
  bootstrap: [AppComponent]
})
export class AppModule {

}
