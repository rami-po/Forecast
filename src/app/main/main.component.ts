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
  public weeks;
  public entries = [];
  public rollUps = [];
  private side;
  private header;
  private capacityHeader;
  private table;
  private forecast;
  @Input() public params = '';
  public hasProject = false;
  public row = -1;

  public employees;
  public projects;
  public clients;

  public projectName = 'All Projects';
  public clientName = 'All Clients';

  constructor(private mainService: MainService,
              private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.side = document.getElementById('side');
    this.header = document.getElementById('header');
    this.capacityHeader = document.getElementById('capacity-header');

    const monday = this.mainService.getMonday(new Date());
    this.weeks = this.mainService.getWeeks(monday);
    EntryComponent.setWeeks(this.weeks);
    GridViewComponent.weeks = this.weeks;

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
        this.projects.splice(0, 0, {id: '', name: 'All'});
      }
    );

    this.mainService.getClients('?active=1').subscribe(
      data => {
        this.clients = data.result;
        this.clients.splice(0, 0, {id: '', name: 'All'});
      }
    );
  }

  getRollUps(params) {
    this.rollUps.length = 0;
    this.mainService.getEmployees('?active=1' + params).subscribe(
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
              } else {
                const index = this.employees.indexOf(employee);
                this.employees.splice(index, 1);
              }
            }
          );
        }
        this.mainService.rollUps.next(this.rollUps);
        console.log('Roll ups:');
        console.log(this.rollUps);
        console.log('------------');
      }
    );

  }

  updateEntries(entry, id, name) {
    if (id !== '') {
      if (entry === 'project') {
        this.params = '&projectId=' + id;
        this.projectName = name;
        this.clientName = 'All Clients';
      } else {
        this.params = '&clientId=' + id;
        console.log(this.params);
        this.clientName = name;
        this.projectName = 'All Projects';
      }
    } else {
      this.params = '';
      this.projectName = 'All Projects';
      this.clientName = 'All Clients';
    }

    this.getRollUps(this.params);

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
