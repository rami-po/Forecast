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

  public isDataAvailable = false;

  constructor(private forecastService: ForecastService,
              private rollUpService: RollUpService) {
  }

  ngOnInit() {
    this.getEntries();
  }

  getDifference(employeeCap, capacity) {
    return capacity - employeeCap;
  }

  getEntries() {
    this.forecastService.getResources('?employeeId=' + this.employee.id + '&active=1').subscribe(
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

        this.entries.length = 0;
        for (let row = 0; row < this.data.length; row++) {
          this.entries.push([]);
          for (let i = 0; i < resources.result.length; i++) {
            if (this.data[row].project_id === resources.result[i].project_id) {
              this.entries[row].push({
                week: resources.result[i].week_of.substring(0, 10),
                capacity: resources.result[i].capacity
              });
            }
          }
        }

        if (this.params.id !== '') {
          this.forecastService.getResources('?employeeId=' + this.employee.id + '&' +
            this.params.path + 'Id=' + this.params.id + '&active=1').subscribe(
            filteredResources => {
              const filteredCapacities = filteredResources.totalCapacities;
              this.filteredCapacities = filteredCapacities;
              let filteredResourcesIndex = 0;
              for (let resourcesIndex = 0; resourcesIndex < this.totalCapacities.length; resourcesIndex++) {
                if (filteredResourcesIndex < filteredCapacities.length &&
                  this.totalCapacities[resourcesIndex].week === filteredCapacities[filteredResourcesIndex].week) {
                  const filteredCapacity = filteredCapacities[filteredResourcesIndex].capacity;
                  const totalCapacity = this.totalCapacities[resourcesIndex].capacity;
                  this.totalCapacities[resourcesIndex].capacity = (filteredCapacity === totalCapacity ?
                    filteredCapacity :
                    filteredCapacity + ' / ' + totalCapacity);
                  filteredResourcesIndex++;
                } else {
                  this.totalCapacities[resourcesIndex].capacity = '0 / ' + this.totalCapacities[resourcesIndex].capacity;
                }
              }
              this.isDataAvailable = true;
              // this.refreshData();
            }
          );
        } else {
          this.isDataAvailable = true;
          // this.refreshData();
        }
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
