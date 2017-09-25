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
  @Input() public row;
  @Input() public params;

  public entries = [];
  public totalCapacities;
  public filteredCapacities;


  public headerData;
  constructor() {
  }

  ngOnInit() {
    this.headerData = this.data[0].forecast.totals;
  }

  getEntry(firstName: string, lastName: string, employeeId: number, clientName: string, clientId: number,
           projectName: string, projectId: number, weekOf: string, capacity: number): Entry {
    return new Entry(firstName, lastName, employeeId, clientName, clientId, projectName, projectId, weekOf, capacity);
  }

}
