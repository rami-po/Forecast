import {Component, Input, OnInit} from '@angular/core';
import {Entry} from "../entry/entry.model";
import {ForecastService} from "../forecast.service";
import {DatePipe} from "@angular/common";
import {Subject} from "rxjs/Subject";
import {RollUpService} from "./roll-up.service";
import {isNullOrUndefined, isUndefined} from "util";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-roll-up',
  templateUrl: './roll-up.component.html',
  styleUrls: ['./roll-up.component.scss'],
  providers: []
})
export class RollUpComponent implements OnInit {

  @Input() public employee;
  @Input() public data;
  @Input() public params;
  public filteredEntry;
  public isDataAvailable = false;

  constructor() {
  }

  ngOnInit() {
    if (this.params.id !== '') {
      for (const entry of this.data) {
        if (entry.project_id === Number(this.params.id) || entry.client_id === Number(this.params.id)) {
          this.filteredEntry = JSON.parse(JSON.stringify(entry.forecast));
          console.log(entry.forecast.data);
          break;
        }
      }
    } else {
      this.filteredEntry = this.data[0].forecast;
    }

    this.isDataAvailable = true;

  }

  getEntry(firstName: string, lastName: string, employeeId: number, clientName: string, clientId: number,
           projectName: string, projectId: number, weekOf: string, capacity: number): Entry {
    return new Entry(firstName, lastName, employeeId, clientName, clientId, projectName, projectId, weekOf, capacity);
  }

}
