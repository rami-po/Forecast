import {AfterViewInit, Component, HostListener, Input, OnInit} from '@angular/core';
import {Entry} from '../entry/entry.model';
import {ForecastComponent} from '../forecast.component';
import {ForecastService} from '../forecast.service';
import {EntryComponent} from '../entry/entry.component';
import {isNullOrUndefined} from 'util';
import {Observable} from 'rxjs/Observable';
import {DomSanitizer} from "@angular/platform-browser";
import {MdDialog, MdIconRegistry} from "@angular/material";
import {StatusMessageDialogComponent} from "../status-message/status-message.component";
import {Subject} from "rxjs/Subject";
import {FakeEmployeeComponent} from "./fake-employee/fake-employee.component";
import * as io from 'socket.io-client';
import {SideListService} from "./side-list.service";

@Component({
  selector: 'app-side-list',
  templateUrl: './side-list.component.html',
  styleUrls: ['./side-list.component.scss'],
  providers: [SideListService]
})
export class SideListComponent implements OnInit {

  @Input() public isProjectView = false;
  @Input() public entries;
  @Input() public employees;
  @Input() public params;
  @Input() public unassignedEmployees;
  public name: string;
  private lastEmployeeId;
  private lastEmployeeId2;
  private timerSubscription;
  private timerSubscription2;
  public realEmployees;
  private socket;

  constructor(private forecastService: ForecastService,
              private iconRegistry: MdIconRegistry,
              private sanitizer: DomSanitizer,
              private dialog: MdDialog,
              private sideListService: SideListService) {
    iconRegistry
      .addSvgIcon('delete', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_delete_black_48px.svg'))
      .addSvgIcon('more', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_more_vert_black_48px.svg'));
    this.socket = this.forecastService.socket;
  }


  ngOnInit() {
    console.log('ngOnInit: side-list.component params:' + JSON.stringify(this.params));

    this.forecastService.employees$.subscribe(
      data => {
        console.log('RECEIVED UPDATED employees data in side-list.components'); console.log(data);
        this.employees = data;
        // use a clone of allEmployees for this
        const allEmployees = this.forecastService.allEmployees.getValue().slice(0);
        console.log('allEmployees'); console.log(allEmployees);
        for (let i = 0; i < this.employees.length; i++) {
          allEmployees.find(
            (item, index) => {
              if (!isNullOrUndefined(item) && !isNullOrUndefined(this.employees[i]) && item.id === this.employees[i].id) {
                allEmployees.splice(index, 1);
                return index;
              }
            }
          );
        }
        this.unassignedEmployees = allEmployees;
        this.unassignedEmployees.splice(0, 0, {id: 'fake_id', first_name: 'Add', last_name: 'Other'});
        console.log('unassignedEmployees'); console.log(this.unassignedEmployees);
      }
    );

    this.forecastService.allEmployees$.subscribe(
      data => {
        console.log('RECEIVED UPDATED allEmployees data in side-list.components ' + data.length); console.log(data);
        console.log('NEED TO UPDATE UNASSIGNED EMPLOYEES: '); console.log(this.params);
        let allEmployees = data.slice(0);
        for (let i = 0; i < this.employees.length; i++) {
          allEmployees.find(
            (item, index) => {
              if (!isNullOrUndefined(item) && !isNullOrUndefined(this.employees[i]) && item.id === this.employees[i].id) {
                allEmployees.splice(index, 1);
                return index;
              }
            }
          );
        }
        this.unassignedEmployees = allEmployees;
        this.unassignedEmployees.splice(0, 0, {id: 'fake_id', first_name: 'Add', last_name: 'Other'});

        allEmployees = data.slice(0);
        this.realEmployees = [];
        allEmployees.forEach(employee => {
          if (!employee.is_fake) {
            this.realEmployees.push(employee);
          }
        });
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

    const projectId = this.params.id;
    const allActiveProjects = this.forecastService.allActiveProjects.getValue();
    const project = allActiveProjects.find( function (p) {
      return p.id == projectId;
    });
    dialog.componentInstance.messages = ['You are adding ' + employee.first_name + ' ' + employee.last_name + ' to the project: ' + project.name + '.'];
    dialog.afterClosed().subscribe(
      confirmed => {
        if (confirmed) {
          this.forecastService.addEmployeeToProject(this.params.id, employee.id).subscribe(
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
          this.forecastService.addFakeEmployee(dialog.componentInstance.inputText, this.params.id).subscribe(
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
                          console.log('this.params'); console.log(this.params);
                          const message = {
                            action: 'deleteFakeEmployee',
                            employeeId: entry.employee_id,
                            clientId: (this.params.path == 'client' ? this.params.id : ''),
                            projectId: (this.params.path == 'project' ? this.params.id : '')
                          };
                          //this.socket.emit('userUpdatedRollUps', message); // everyone gets it, including the sender
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
                            clientId: (this.params.path == 'client' ? this.params.id : ''),
                            projectId: (this.params.path == 'project' ? this.params.id : '')
                          };
                          // this.socket.emit('userUpdatedRollUps', { id: entry.project_id, employeeId: entry.employee_id } ); // everyone gets it, including the sender
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
          console.log('removeEmployeeFromProject:'); console.log(entry);
          this.forecastService.removeEmployeeFromProject(entry.project_id, entry.id, entry.employee_id).subscribe(
            () => {
              const message = {
                action: 'removeEmployeeFromProject',
                employeeId: entry.employee_id,
                entryId: entry.id,
                clientId: (this.params.path == 'client' ? this.params.id : ''),
                projectId: (this.params.path == 'project' ? this.params.id : '')
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



  transformUser(employee) {
    console.log(employee);
  }

  type(value: string, employee) {
    console.log('sending...');
    if (!isNaN(Number(value))) {
      if (!isNullOrUndefined(this.timerSubscription) && employee.id === this.lastEmployeeId) {
        console.log('changed...');
        this.timerSubscription.unsubscribe();
      }
      this.lastEmployeeId = employee.id;
      const timer = Observable.timer(2000);
      this.timerSubscription = timer.subscribe(t => {
        console.log('sent');
        employee.capacity = Number(value) * 3600;
        this.forecastService.putEmployees(employee, this.params).subscribe();
      });
    } else {
      console.log('not a number...');
    }
  }

  edit(value: string, employee) {
    console.log('sending...');
    if (!isNullOrUndefined(this.timerSubscription2) && employee.id === this.lastEmployeeId2) {
      console.log('changed...');
      this.timerSubscription2.unsubscribe();
    }
    this.lastEmployeeId2 = employee.id;
    const timer = Observable.timer(2000);
    this.timerSubscription2 = timer.subscribe(t => {
      console.log('sent');
      employee.first_name = value;
      this.forecastService.putFakeEmployees(employee).subscribe();
    });
  }

  openConsole(employee) {
    const dialog = this.dialog.open(FakeEmployeeComponent);
    dialog.componentInstance.title = employee.first_name;
    dialog.componentInstance.dismissible = true;
    dialog.componentInstance.custom = true;
    dialog.componentInstance.input = true;
    dialog.componentInstance.realEmployees = this.realEmployees;
    dialog.componentInstance.fakeEmployee = employee;
    dialog.componentInstance.params = this.params;
    dialog.afterClosed().subscribe(
      confirmed => {
        if (confirmed) {
          if (dialog.componentInstance.inputText.length > 0) {
            employee.first_name = dialog.componentInstance.inputText;
            this.forecastService.putFakeEmployees(employee).subscribe();
          }
        }
      }
    );
  }

  getName(entry): string {
    return entry[0].first_name + ' ' + entry[0].last_name;
  }

  updateState(employee) {
    employee.opened = !employee.opened;
    if (employee.opened) {
      this.params.openEmployees.push(employee.id);
    }
    else {
      let i = this.params.openEmployees.indexOf(employee.id);
      if (i != -1) {
        this.params.openEmployees.splice(i, 1);
      }
    }
  }

}
