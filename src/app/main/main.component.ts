/**
 * Created by Rami Khadder on 8/7/2017.
 */
import {Component, Input, OnInit} from '@angular/core';
import {Entry} from './entry/entry.model';
import {MainService} from './main.service';
import {EntryComponent} from './entry/entry.component';
import {DatePipe} from '@angular/common';
import {GridViewComponent} from './grid-view/grid-view.component';
import {isNullOrUndefined} from "util";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit {
  public static numberOfWeeks = 20;
  public entries = [];
  public rollUps = [];
  private side;
  private header;
  private table;
  private forecast;
  @Input() private params = '';
  public hasProject = false;
  public row = -1;

  public employees;
  public projects;
  public clients;

  constructor(private mainService: MainService,
              private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.side = document.getElementById('side');
    this.header = document.getElementById('header');

    const monday = this.mainService.getMonday(new Date());
    const weeks = this.mainService.getWeeks(monday);
    EntryComponent.setWeeks(weeks);
    GridViewComponent.weeks = weeks;

    // if it isn't the main route
    if (this.params !== '') {
      this.hasProject = true;
      this.table = document.getElementById('table');
      this.forecast = document.getElementById('forecast');
      const title = document.getElementById('title');
      const name = document.getElementById('name');
      this.table.style.height = '50vh';
      this.table.style.width = '85%';
      this.table.style.marginLeft = '15%';
      this.header.style.marginLeft = '15%';
      this.side.style.width = '15%';
      this.side.style.height = '45vh';
      this.forecast.style.height = '60vh';
      title.style.width = '15%';
      name.style.width = '100%';
    }

    this.getRollUps('');

    this.mainService.getProjects('?active=1').subscribe(
      data => {
        this.projects = data.result;
      }
    );

    this.mainService.getClients('?active=1').subscribe(
      data => {
        this.clients = data.result;
      }
    );

    this.mainService.getEntries(this.params).subscribe(
      data => {
        this.entries = data.result;
        if (this.entries.length <= 5 && this.hasProject) {
          console.log(this.entries.length);
          const pixels = this.entries.length * 70.5;
          console.log(pixels);
          this.table.style.height = pixels + 'px';
          this.table.style.overflowY = 'hidden';
          this.header.style.marginRight = '0px';
          this.forecast.style.height = Number(pixels + 64) + 'px';
        }
      });

    const activeTag = (this.params === '' ? '?' : '&');

    this.mainService.getResources(this.params + activeTag + 'active=1').subscribe(
      data => {
        // HeaderRowComponent.totalCapacities = data.totalCapacities;
        console.log(data.result);
      });
  }

  getRollUps(params) {
    this.rollUps.length = 0;
    this.mainService.getEmployees('?active=1').subscribe(
      data => {
        this.employees = data.result;
        for (let i = 0; i < this.employees.length; i++) {
          this.employees[i].opened = false;
        }
        for (const employee of this.employees) {
          this.mainService.getEntries('?employeeid=' + employee.id + params).subscribe(
            entries => {
              if (entries.result.length > 0) {
                this.rollUps.push(entries.result);
              }
            }
          );
        }
        this.mainService.rollUps.next(this.rollUps);
        console.log('Roll ups:');
        console.log(this.rollUps);
      }
    );
  }

  updateEntries(entry, id) {
    const idType = (entry === 'project' ? 'projectId' : 'clientId');
    this.params = '&' + idType + '=' + id;

    this.getRollUps(this.params);

    this.params = '?' + idType + '=' + id;

    // this.mainService.getEntries(this.params).subscribe(
    //   data => {
    //     this.entries = data.result;
    //   }
    // );

    this.mainService.getResources(this.params + '&active=1').subscribe(
      data => {
        // EntryComponent.resources = data.result;
      }
    );
  }

  getEntry(firstName: string, lastName: string, employeeId: number, clientName: string, clientId: number,
           projectName: string, projectId: number, weekOf: string, capacity: number, boxNumber: number): Entry {
    return new Entry(firstName, lastName, employeeId, clientName, clientId, projectName, projectId, weekOf, capacity, boxNumber);
  }

  getRow(row, x) {
    console.log('row: ' + row + ', x: ' + x);
    return this.row++;
  }

  getLength(array) {
    if (!isNullOrUndefined(array)) {
      return array.length;
    }
    return 0;
  }

  onScroll($event) {
    this.side.scrollTop = $event.srcElement.scrollTop;
    this.header.scrollLeft = $event.srcElement.scrollLeft;
  }

}
