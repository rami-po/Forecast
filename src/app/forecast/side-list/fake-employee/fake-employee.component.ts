import {Component, OnInit} from '@angular/core';
import {MdDialog, MdDialogRef} from '@angular/material';
import {ForecastService} from "../../forecast.service";
import {StatusMessageDialogComponent} from "../../status-message/status-message.component";
import {isNullOrUndefined} from "util";
import * as io from 'socket.io-client';
import {SideListService} from "../side-list.service";

@Component({
  selector: 'app-fake-employee-prompt',
  templateUrl: './fake-employee.component.html',
  styleUrls: ['./fake-employee.component.scss'],
  providers: [SideListService]
})
export class FakeEmployeeComponent implements OnInit {

  public messages: any;
  public title: string;
  public dismissible = false;
  public success = false;
  public error = false;
  public warning = false;
  public custom = false;
  public input = false;
  public inputText;
  public fakeEmployee;
  public realEmployees;
  public params;
  private socket;

  constructor(public dialogRef: MdDialogRef<FakeEmployeeComponent>,
              private dialog: MdDialog,
              private forecastService: ForecastService,
              private sideListService: SideListService) {
    this.socket = io(window.location.hostname + ':3000');
}

  ngOnInit() {
    console.log('ngOnInit - fake-employee.component.ts params: ' + JSON.stringify(this.params)); // console.log(this.params);

  }

  onKey(event) {
    this.inputText = event.target.value;
  }

  transformUser(employee) {
    console.log(employee);
    this.dialogRef.close(false);

    this.forecastService.getProjects('?active=1&employeeId=' + employee.id).subscribe(
      data1 => {
        this.forecastService.getProjects('?active=1&employeeId=' + this.fakeEmployee.id).subscribe(
          data2 => {
            console.log(data1);
            console.log(data2);

            const realProjects = data1.result;
            const fakeProjects = data2.result;
            let conflicts = [];
            for (let i = 0; i < realProjects.length; i++) {
              for (let j = 0; j < fakeProjects.length; j++) {
                if (realProjects[i].id === fakeProjects[j].id) {
                  realProjects[i]['isResolved'] = false;
                  conflicts.push(realProjects[i]);
                }
              }
            }
            if (conflicts.length > 0) {
              const dialog = this.dialog.open(StatusMessageDialogComponent);
              dialog.componentInstance.error = true;
              dialog.componentInstance.title = 'Warning: Conflict(s) Found';
              dialog.componentInstance.messages = ['Check the boxes for the projects you wish to merge.'];
              dialog.componentInstance.options = conflicts;
              dialog.componentInstance.dismissible = true;
              dialog.afterClosed().subscribe(
                (confirmed) => {
                  if (confirmed) {
                    conflicts = dialog.componentInstance.options;
                    let j = 0;
                    for (let i = 0; i < fakeProjects.length; i++) {
                      if (fakeProjects[i].id === conflicts[j].id && !conflicts[j].isResolved) {
                        j++;
                      } else if (fakeProjects[i].id === conflicts[j].id && conflicts[j].isResolved) {
                        this.updateData(employee.id, fakeProjects[i].id);
                      } else {
                        this.forecastService.addEmployeeToProject(fakeProjects[i].id, employee.id).subscribe(
                          () => {
                            this.updateData(employee.id, fakeProjects[i].id);
                          }
                        );
                      }
                    }
                  }
                }
              );
            } else {
              for (let i = 0; i < fakeProjects.length; i++) {
                this.forecastService.addEmployeeToProject(fakeProjects[i].id, employee.id).subscribe(
                  () => {
                    this.updateData(employee.id, fakeProjects[i].id);
                  }
                );
              }

            }
          }
        );
      }
    );

  }

  updateData(employeeId, fakeProjectId) {
    this.forecastService.updateResources(employeeId, this.fakeEmployee.id, fakeProjectId).subscribe(
      () => {
        this.forecastService.getAssignments('?employee_id=' + this.fakeEmployee.id + '&project_id=' + fakeProjectId).subscribe(
          assignment => {
            this.forecastService.deleteFakeAssignment(assignment.result[0].id, this.fakeEmployee.id, fakeProjectId).subscribe(
              () => {
                this.forecastService.deleteFakeEmployee(this.fakeEmployee.id).subscribe(
                  () => {
                    const message = {
                      action: 'transformFakeEmployee',
                      employeeId: '',
                      clientId: (this.params.path == 'client' ? this.params.id : ''),
                      projectId: (this.params.path == 'project' ? this.params.id : '')
                    };
                    // this.socket.emit('userUpdatedRollUps', 'transformFakeEmployee'); // everyone gets it, including the sender
                    this.params.clearcache = true;
                    this.forecastService.updateAllEmployees();
                    // this.forecastService.updateEmployees(this.params);
                    this.forecastService.updateRollUps(this.params);
                    this.socket.emit('broadcastUpdatedRollUps', message); // everyone but the sender gets it
                  }
                );
              }
            );
          }
        );
      }
    );
  }
}
