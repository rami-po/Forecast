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

@Component({
  selector: 'app-side-list',
  templateUrl: './side-list.component.html',
  styleUrls: ['./side-list.component.scss']
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

  constructor(private forecastService: ForecastService,
              private iconRegistry: MdIconRegistry,
              private sanitizer: DomSanitizer,
              private dialog: MdDialog) {
    iconRegistry
      .addSvgIcon('delete', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_delete_black_48px.svg'))
      .addSvgIcon('more', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_more_vert_black_48px.svg'));
  }


  ngOnInit() {

    this.forecastService.rollUps$.subscribe(
      data => {
        this.entries = data;
      }
    );

    this.forecastService.employees$.subscribe(
      data => {
        this.employees = data;
        this.getUnassignedEmployees();
      }
    );

    this.forecastService.params$.subscribe(
      data => {
        this.params = data;
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
    if (employee.id === 'fake_id') {
      this.addFakeUser(dialog);
      return null;
    }
    dialog.componentInstance.messages = ['You are adding ' + employee.first_name + ' ' + employee.last_name +
    ' to the project: ' + this.entries[0][0].project_name + '.'];
    dialog.afterClosed().subscribe(
      confirmed => {
        if (confirmed) {
          this.forecastService.addEmployeeToProject(this.params.substring(this.params.indexOf('project') + 10), employee.id).subscribe(
            () => {
              this.forecastService.updateRollUps(this.params);
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
          this.forecastService.addFakeEmployee(dialog.componentInstance.inputText,
            this.params.substring(this.params.indexOf('project') + 10)).subscribe(
            () => {
              this.forecastService.updateRollUps(this.params);
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
          this.forecastService.removeEmployeeFromProject(entry.project_id, entry.id).subscribe(
            data => {
              this.forecastService.updateRollUps(this.params);
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
