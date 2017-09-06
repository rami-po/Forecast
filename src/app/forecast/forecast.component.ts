/**
 * Created by Rami Khadder on 8/7/2017.
 */
import {Component, Input, OnInit} from '@angular/core';
import {Entry} from './entry/entry.model';
import {ForecastService} from './forecast.service';
import {EntryComponent} from './entry/entry.component';
import {DatePipe} from '@angular/common';
import {GridViewComponent} from './grid-view/grid-view.component';
import {isNullOrUndefined} from 'util';
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss']
})

export class ForecastComponent implements OnInit {
  public weeks;
  public rollUps = [];
  private side;
  private header;
  private capacityHeader;
  private table;
  private forecast;
  @Input() public params = '';
  @Input() public height = '85.9vh';
  @Input() public forecastHeight = '100vh';
  private lastParams;
  public hasProject = false;

  public employees;
  public projects;
  public clients;

  public isDataAvailable = false;
  public mode = 'indeterminate';

  constructor(private forecastService: ForecastService,
              private datePipe: DatePipe) {
  }

  ngOnInit() {

    this.side = document.getElementById('side');
    this.header = document.getElementById('header');
    this.capacityHeader = document.getElementById('capacity-header');
    this.table = document.getElementById('table');
    this.forecast = document.getElementById('forecast');

    this.table.style.height = this.height;
    this.side.style.height = this.height;
    this.forecast.style.height = this.forecastHeight;

    const monday = this.forecastService.getMonday(new Date());
    this.weeks = this.forecastService.getWeeks(monday);
    EntryComponent.setWeeks(this.weeks);
    GridViewComponent.weeks = this.weeks;

    // if it isn't the main route
    // if (this.params !== '') {
    //   this.hasProject = true;
    //   this.table = document.getElementById('table');
    //   this.forecast = document.getElementById('forecast');
    //   const title = document.getElementById('title');
    //   const name = document.getElementById('name');
    //   this.table.style.height = '50vh';
    //   this.table.style.width = '85%';
    //   this.table.style.marginLeft = '15%';
    //   this.header.style.marginLeft = '15%';
    //   this.side.style.width = '15%';
    //   this.side.style.height = '45vh';
    //   this.forecast.style.height = '60vh';
    //   title.style.width = '15%';
    //   name.style.width = '100%';
    // }

    this.forecastService.params$.subscribe(
      params => {
        this.params = params;
        if (this.params !== this.lastParams) {
          this.lastParams = this.params;
          this.getRollUps(params);
        }
      }
    );

    // this.forecastService.projects$.subscribe(
    //   projects => {
    //     this.projects = projects;
    //     this.isProjectDataAvailable = true;
    //   }
    // );
    //
    // this.forecastService.clients$.subscribe(
    //   clients => {
    //     this.clients = clients;
    //     this.isClientDataAvailable = true;
    //   }
    // );

    this.forecastService.getProjects('?active=1').subscribe(
      data => {
        this.projects = data.result;
        this.projects.splice(0, 0, {id: '', name: 'All'});
      }
    );

    this.forecastService.getClients('?active=1').subscribe(
      data => {
        this.clients = data.result;
        this.clients.splice(0, 0, {id: '', name: 'All'});
      }
    );
  }

  getRollUps(params) {
    const rollUps = [];
    this.forecastService.getEmployees('?active=1' + params).subscribe(
      data => {
        const employees = data.result;
        for (let i = 0; i < employees.length; i++) {
          employees[i].opened = false;
        }
        for (const employee of employees) {
          this.forecastService.getEntries('?employeeid=' + employee.id + params).subscribe(
            entries => {
              if (entries.result.length > 0) {
                rollUps.push(entries.result);
              } else {
                const index = employees.indexOf(employee);
                employees.splice(index, 1);
              }
            }
          );
        }

        this.employees = employees;
        this.rollUps = rollUps;

        this.forecastService.getResources('?' + params.substring(1) + '&active=1').subscribe(
          resources => {
            this.forecastService.filteredResources.next(resources);
            this.isDataAvailable = true;
            this.mode = 'determinate';
            // this.refreshData();
          }
        );
      }
    );
  }


  getEntry(firstName: string, lastName: string, employeeId: number, clientName: string, clientId: number,
           projectName: string, projectId: number, weekOf: string, capacity: number, boxNumber: number): Entry {
    return new Entry(firstName, lastName, employeeId, clientName, clientId, projectName, projectId, weekOf, capacity, boxNumber);
  }

  onScroll($event) {
    this.side.scrollTop = $event.srcElement.scrollTop;
    this.header.scrollLeft = $event.srcElement.scrollLeft;
    this.capacityHeader.scrollLeft = $event.srcElement.scrollLeft;
  }

}
