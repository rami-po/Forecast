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
import {GraphService} from '../project/graph/graph.service';

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
  @Input() public params: any;
  @Input() public height = '85.9vh';
  @Input() public forecastHeight = '100vh';
  @Input() public isProjectView = false;
  private lastParams;

  public employees;
  public projects;
  public clients;

  public isDataAvailable = false;
  public mode = 'indeterminate';

  constructor(private forecastService: ForecastService, private graphService: GraphService) {
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

    this.forecastService.combinedRollUps$.subscribe(
      data => {
        this.rollUps = data.rollUps;
        this.employees = data.employees;
        console.log('combinedRollUps'); console.log(data);
        this.isDataAvailable = true;
        if (this.params.path == 'project') {
          this.graphService.initializeGraph(this.params);
        }
      }
    );

    // TODO - not in use - when can we delete?
    // this.forecastService.params$.subscribe(
    //   params => {
    //     this.params = params;
    //     if (this.params !== this.lastParams) {
    //       this.lastParams = this.params;
    //       this.forecastService.updateRollUps(params);
    //     }
    //   }
    // );

    this.forecastService.allActiveProjects$.subscribe(
      projects => {
        if (!isNullOrUndefined(projects)) {
          this.projects = projects;
        }
      }
    );

    this.forecastService.getClients('?active=1').subscribe(
      data => {
        this.clients = data.result;
        this.clients.splice(0, 0, {id: '', name: 'All'});
      }
    );

    // listen for update messages from the server, and then update roll ups when received
    // should only update when the current view is affected by the update:
    //   0) when the current view is the main view (all projects)
    //   1) when a new fake user has been added, deleted, or transformed
    //   2) when the current view and the update have the same project ID
    //   3) when the current view is a client view, and the update is in one of the client's projects
    //   4) when the current view and the update have different project IDs, but the same employee ID
    this.forecastService.getUpdateMessages().subscribe(
      data => {
        const message = data as any;
        const action = message.action;
        const projectId = (!isNullOrUndefined(message.projectId) ? message.projectId : false);
        const employeeId = (!isNullOrUndefined(message.employeeId) ? message.employeeId : false);
        const clientId = (!isNullOrUndefined(message.clientId) ? message.clientId : false);

        const pageId = this.params.id;
        const currentEmployees = this.forecastService.employees.getValue();

        console.log('received an update message: ' + action); console.log(this.params);

        if (pageId === '') {
          // the current view is of all projects. any change requires an update
          this.forecastService.updateRollUps(this.params);
        }
        else if (action === 'addFakeEmployee' || action === 'deleteFakeEmployee' || action === 'transformFakeEmployee') {
          // adding, deleting, or transforming a fake employee requires an update, regardless of the project, because everyone's add an employee list has been changed
          this.forecastService.updateAllEmployees();
          this.forecastService.updateRollUps(this.params);
        }
        else if (pageId === clientId) {
          // a change occurred in the current client view. an update is required
          this.forecastService.updateRollUps(this.params);
        }
        else if (pageId === projectId) {
          // a change occurred in the current project. an update is required
          this.forecastService.updateRollUps(this.params);
        }
        else if (employeeId != false && !isNullOrUndefined(currentEmployees.find(employee => employee.id === employeeId))) {
          // an employee in the current client or project view has an updated entry in another project. we need to update this view.
          this.forecastService.updateRollUps(this.params);
        }
        // still need to handle the case of something changing in a related view (client or project)
      });
  }

  onScroll($event) {
    this.side.scrollTop = $event.srcElement.scrollTop;
    this.header.scrollLeft = $event.srcElement.scrollLeft;
    this.capacityHeader.scrollLeft = $event.srcElement.scrollLeft;
  }
}
