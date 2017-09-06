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
  providers: [RollUpService]
})
export class RollUpComponent implements OnInit {

  @Input() public employee;
  @Input() public data;
  @Input() public row;
  @Input() public params;

  public entries = [];
  public totalCapacities;

  public isDataAvailable = false;

  constructor(private mainService: ForecastService,
              private rollUpService: RollUpService) {
  }

  ngOnInit() {
    this.getEntries();
  }

  getDifference(employeeCap, capacity) {
    return capacity - employeeCap;
  }

  getEntries() {
    this.mainService.getResources('?employeeId=' + this.employee.id + '&active=1').subscribe(
      resources => {
        this.totalCapacities = resources.totalCapacities;
        for (let i = 0; i < this.totalCapacities.length; i++) {
          const difference = this.getDifference(this.employee.capacity / 3600, this.totalCapacities[i].capacity);
          if (difference === 0) {
            (this.totalCapacities[i])['color'] = 'white';
          } else if (difference > 0) {
            (this.totalCapacities[i])['color'] = '#FFF59D';
          } else if (difference < 0) {
            (this.totalCapacities[i])['color'] = '#EF9A9A';
          }
        }
        this.mainService.getResources('?employeeId=' + this.employee.id + this.params + '&active=1').subscribe(
          data => {
            this.entries.length = 0;
            for (let row = 0; row < this.data.length; row++) {
              this.entries.push([]);
              for (let i = 0; i < data.result.length; i++) {
                if (this.data[row].project_id === data.result[i].project_id) {
                  this.entries[row].push({
                    week: data.result[i].week_of.substring(0, 10),
                    capacity: data.result[i].capacity
                  });
                }
              }
            }
            this.isDataAvailable = true;
            this.refreshData();
          }
        );
      }
    );
  }

  private refreshData() {
    Observable.timer(10000).first().subscribe(
      () => {
        this.getEntries();
      }
    );
  }

  getEntry(firstName: string, lastName: string, employeeId: number, clientName: string, clientId: number,
           projectName: string, projectId: number, weekOf: string, capacity: number, boxNumber: number): Entry {
    return new Entry(firstName, lastName, employeeId, clientName, clientId, projectName, projectId, weekOf, capacity, boxNumber);
  }

}
