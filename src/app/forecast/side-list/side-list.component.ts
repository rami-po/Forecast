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

    this.forecastService.employees$.subscribe(
      data => {
        this.employees = data;
        this.getUnassignedEmployees();
      }
    );

    this.forecastService.getEmployees('?real=1&active=1').subscribe(
      data => {
        console.log(data.result);
        this.realEmployees = data.result;
      }
    );
  }

  getUnassignedEmployees() {
    this.forecastService.getEmployees('?active=1').subscribe(
      data => {
        const allEmployees = data.result;
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
      }
    );

  }

  addUser(employee) {
    const dialog = this.dialog.open(StatusMessageDialogComponent);
    dialog.componentInstance.custom = true;
    dialog.componentInstance.dismissible = true;
    dialog.componentInstance.title = 'Are you sure?';
    console.log('br0?');
    if (employee.id === 'fake_id') {
      this.addFakeUser(dialog);
      return null;
    }

    console.log('o');

    this.forecastService.getProjects('/' + this.params.id).subscribe(
      project => {
        dialog.componentInstance.messages = ['You are adding ' + employee.first_name + ' ' + employee.last_name +
        ' to the project: ' + project.result[0].name + '.'];
        dialog.afterClosed().subscribe(
          confirmed => {
            if (confirmed) {
              this.forecastService.addEmployeeToProject(this.params.id, employee.id).subscribe(
                () => {
                  this.socket.emit('userUpdatedRollUps', { id: this.params.id, employeeId: employee.id, clientId: project.result[0].clientId }); // everyone gets it, including the sender
                  // this.forecastService.updateRollUps(this.params);
                }
              );
            }
          }
        );
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
              this.socket.emit('userUpdatedRollUps', 'addFakeEmployee'); // everyone gets it, including the sender
              // this.forecastService.updateRollUps(this.params);
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
            console.log('deleteUser - entry: ' + JSON.stringify(entry));
            this.forecastService.getAssignments('?employeeId=' + entry.employee_id).subscribe(
              allAssignments => {
                if (allAssignments.result.length === 1) {
                  this.forecastService.deleteFakeAssignment(allAssignments.result[0].id).subscribe(
                    () => {
                      this.forecastService.deleteFakeEmployee(entry.employee_id).subscribe(
                        () => {
                          this.socket.emit('userUpdatedRollUps', 'deleteFakeEmployee'); // everyone gets it, including the sender
                          // this.forecastService.updateRollUps(this.params);
                        }
                      );
                    }
                  );
                } else {
                  this.forecastService.getAssignments('?employeeId=' + entry.employee_id + '&projectId=' + entry.project_id).subscribe(
                    assignment => {
                      this.forecastService.deleteFakeAssignment(assignment.result[0].id).subscribe(
                        () => {
                          this.socket.emit('userUpdatedRollUps', { id: entry.project_id, employeeId: entry.employee_id } ); // everyone gets it, including the sender
                          // this.forecastService.updateRollUps(this.params);
                        }
                      );
                    }
                  );
                }
              }
            );
            return null;
          }
          this.forecastService.removeEmployeeFromProject(entry.project_id, entry.id).subscribe(
            () => {
              this.socket.emit('userUpdatedRollUps', { id: entry.project_id, employeeId: entry.employee_id }); // everyone gets it, including the sender
              // this.forecastService.updateRollUps(this.params);
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
        this.forecastService.putEmployees(employee).subscribe();
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
  }

}
