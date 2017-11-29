import {AfterViewInit, Component, HostListener, Input, OnInit} from '@angular/core';
import {Entry} from '../entry/entry.model';
import {ForecastComponent} from '../forecast.component';
import {ForecastService} from '../forecast.service';
import {EntryComponent} from '../entry/entry.component';
import {isNullOrUndefined} from 'util';
import {Observable} from 'rxjs/Observable';
import {DomSanitizer} from '@angular/platform-browser';
import {MdDialog, MdIconRegistry} from '@angular/material';
import {StatusMessageDialogComponent} from '../status-message/status-message.component';
import {Subject} from 'rxjs/Subject';
import * as io from 'socket.io-client';
import {Router} from "@angular/router";

@Component({
  selector: 'app-side-list-projects',
  templateUrl: './side-list-projects.component.html',
  styleUrls: ['./side-list-projects.component.scss']
})
export class SideListProjectsComponent implements OnInit {

  @Input() public entries;
  @Input() public projects;
  @Input() public params;
  public name: string;
  private lastEmployeeId;
  private timerSubscription;
  private socket;
  private listOfUnassignedEmployees = [];
  public unassignedEmployees;

  private currentProject;

  constructor(private forecastService: ForecastService,
              private router: Router,
              private iconRegistry: MdIconRegistry,
              private sanitizer: DomSanitizer,
              private dialog: MdDialog) {
    iconRegistry
      .addSvgIcon('add', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_add.svg'))
      .addSvgIcon('delete', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_remove.svg'));
    this.socket = this.forecastService.socket;
  }

  ngOnInit() {
    console.log('ngOnInit: side-list.component params:' + JSON.stringify(this.params));

    this.forecastService.projects$.subscribe(
      data => {
        console.log(data);
        this.projects = data;
        this.entries = data.entries;
      }
    );
  }

  goToPersonnelPage(employeeId) {
    this.router.navigate(['/user', employeeId]);
  }

  updateUnassignedEmployees(project, index) {
    this.currentProject = project;
    this.unassignedEmployees = null;
    if (this.listOfUnassignedEmployees[index]) {
      this.unassignedEmployees = this.listOfUnassignedEmployees[index];
      console.log(this.unassignedEmployees);
      return;
    }

    this.forecastService.allEmployees$.subscribe(
      data => {
        const allEmployees = JSON.parse(JSON.stringify(data));

        // iterate through employees on projects
        for (let i = 0; i < this.entries[index].length; i++) {
          for (let j = 0; j < allEmployees.length; j++) {
            if (this.entries[index][i].employee_id == allEmployees[j].id) {
              allEmployees.splice(j, 1);
            }
          }
        }
        allEmployees.splice(0, 0, {id: 'fake_id', first_name: 'Add', last_name: 'Other'});
        this.listOfUnassignedEmployees[index] = allEmployees;
        this.unassignedEmployees = allEmployees;
      }
    );
  }

  addUser(employee) {
    const dialog = this.dialog.open(StatusMessageDialogComponent);
    dialog.componentInstance.custom = true;
    dialog.componentInstance.dismissible = true;
    dialog.componentInstance.title = 'Are you sure?';
    if (employee.id === 'fake_id') {
      this.addFakeUser(dialog);
      return null;
    }

    dialog.componentInstance.messages = ['You are adding ' + employee.first_name + ' ' + employee.last_name + ' to the project: ' + this.currentProject.name + '.'];
    dialog.afterClosed().subscribe(
      confirmed => {
        if (confirmed) {
          this.forecastService.addEmployeeToProject(this.currentProject.id, employee.id).subscribe(
            () => {
              const message = {
                action: 'addEmployeeToProject',
                employeeId: employee.id,
                clientId: (this.params.path == 'client' ? this.params.id : ''),
                projectId: (this.params.path == 'project' ? this.params.id : '')
              };
              // this.socket.emit('userUpdatedRollUps', message); // everyone gets it, including the sender
              this.params.clearcache = true;
              // this.forecastService.updateEmployees(this.params);
              this.forecastService.updateRollUps(this.params);
              this.socket.emit('broadcastUpdatedRollUps', message); // everyone but the sender gets it
            }
          );
        }
      }
    );
  }

  addFakeUser(dialog) {
    dialog.componentInstance.title = 'Add Other Employee';
    dialog.componentInstance.input = true;
    dialog.componentInstance.messages = ['Enter a name please.'];
    dialog.afterClosed().subscribe(
      confirmed => {
        if (confirmed) {
          this.forecastService.addFakeEmployee(dialog.componentInstance.inputText, this.currentProject.id).subscribe(
            () => {
              console.log('fake employee added: '); console.log(this.params);
              console.log('emit: userUpdatedRollUps - addFakeEmployee');
              const message = {
                action: 'addFakeEmployee',
                employeeId: '',
                clientId: (this.params.path == 'client' ? this.params.id : ''),
                projectId: (this.params.path == 'project' ? this.params.id : '')
              };
              // need to updateAllEmployees to include new fake employee
              // this.socket.emit('userUpdatedRollUps', message); // everyone gets it
              this.params.clearcache = true;
              this.forecastService.updateAllEmployees();
              // this.forecastService.updateEmployees(this.params);
              this.forecastService.updateRollUps(this.params);
              this.socket.emit('broadcastUpdatedRollUps', message); // everyone but the sender gets it
            }
          );
        }
      }
    );
  }

  deleteUser(entry) {
    const dialog = this.dialog.open(StatusMessageDialogComponent);
    dialog.componentInstance.title = 'Are you sure?';
    dialog.componentInstance.custom = true;
    dialog.componentInstance.dismissible = true;
    dialog.componentInstance.messages = ['You are removing ' + entry.first_name + ' ' + entry.last_name +
    ' from the project: ' + entry.project_name + '.'];
    dialog.afterClosed().subscribe(
      confirmed => {
        if (confirmed) {
          if (entry.last_name === '') { // employee is fake
            this.forecastService.getAssignments('?employee_id=' + entry.employee_id).subscribe(
              allAssignments => {
                if (allAssignments.result.length === 1) {
                  this.forecastService.deleteFakeAssignment(allAssignments.result[0].id, entry.employee_id, entry.project_id).subscribe(
                    () => {
                      this.forecastService.deleteFakeEmployee(entry.employee_id).subscribe(
                        () => {
                          // update roll ups for this user
                          console.log('this.params');
                          console.log(this.params);
                          const message = {
                            action: 'deleteFakeEmployee',
                            employeeId: entry.employee_id,
                            clientId: (this.params.path === 'client' ? this.params.id : ''),
                            projectId: (this.params.path === 'project' ? this.params.id : '')
                          };
                          this.params.clearcache = true;
                          this.forecastService.updateAllEmployees();
                          // this.forecastService.updateEmployees(this.params);
                          this.forecastService.updateRollUps(this.params);
                          this.socket.emit('broadcastUpdatedRollUps', message); // everyone but the sender gets it
                        }
                      );
                    }
                  );
                } else {
                  this.forecastService.getAssignments('?employee_id=' + entry.employee_id + '&project_id=' + entry.project_id).subscribe(
                    assignment => {
                      this.forecastService.deleteFakeAssignment(assignment.result[0].id, entry.employee_id, entry.project_id).subscribe(
                        () => {
                          const message = {
                            action: 'deleteFakeAssignment',
                            employeeId: entry.employee_id,
                            clientId: (this.params.path === 'client' ? this.params.id : ''),
                            projectId: (this.params.path === 'project' ? this.params.id : '')
                          };
                          this.params.clearcache = true;
                          this.forecastService.updateRollUps(this.params);
                          this.socket.emit('broadcastUpdatedRollUps', message); // everyone but the sender gets it
                        }
                      );
                    }
                  );
                }
              }
            );
            return null;
          }
          console.log('removeEmployeeFromProject:');
          console.log(entry);
          this.forecastService.removeEmployeeFromProject(entry.project_id, entry.id, entry.employee_id).subscribe(
            () => {
              const message = {
                action: 'removeEmployeeFromProject',
                employeeId: entry.employee_id,
                entryId: entry.id,
                clientId: (this.params.path === 'client' ? this.params.id : ''),
                projectId: (this.params.path === 'project' ? this.params.id : '')
              };
              // this.socket.emit('userUpdatedRollUps', message); // everyone gets it, including the sender
              this.params.clearcache = true;
              this.forecastService.updateRollUps(this.params);
              this.socket.emit('broadcastUpdatedRollUps', message); // everyone but the sender gets it
            }
          );
        }
      }
    );
  }

  type(value: string, project) {
    console.log('sending...');
    if (!isNaN(Number(value))) {
      if (!isNullOrUndefined(this.timerSubscription) && project.employee_id === this.lastEmployeeId) {
        console.log('changed...');
        this.timerSubscription.unsubscribe();
      }
      this.lastEmployeeId = project.employee_id;
      const timer = Observable.timer(2000);
      this.timerSubscription = timer.subscribe(t => {
        console.log('sent');
        project.capacity = Number(value) * 3600;
        project.id = project.employee_id;
        this.forecastService.putEmployees(project, this.params).subscribe();
      });
    } else {
      console.log('not a number...');
    }
  }

  updateState(employee) {
    employee.opened = !employee.opened;
    if (employee.opened) {
      this.params.openEmployees.push(employee.id);
    } else {
      const i = this.params.openEmployees.indexOf(employee.id);
      if (i !== -1) {
        this.params.openEmployees.splice(i, 1);
      }
    }
  }

}
