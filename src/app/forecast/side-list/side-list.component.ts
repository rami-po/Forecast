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
  public name: string;
  private lastEmployeeId;
  private timerSubscription;

  constructor(private mainService: ForecastService,
              private iconRegistry: MdIconRegistry,
              private forecastService: ForecastService,
              private sanitizer: DomSanitizer,
              private dialog: MdDialog) {
    iconRegistry.addSvgIcon(
      'delete',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_delete_black_48px.svg'));
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
      }
    );

    this.forecastService.params$.subscribe(
      data => {
        this.params = data;
      }
    );

  }

  deleteUser(entry) {
    const dialog = this.dialog.open(StatusMessageDialogComponent);
    dialog.componentInstance.title = 'Are you sure?';
    dialog.componentInstance.error = true;
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
        this.mainService.putEmployees(employee).subscribe();
      });
    } else {
      console.log('not a number...');
    }
  }


  getName(entry): string {
    return entry[0].first_name + ' ' + entry[0].last_name;
  }

  updateState(employee) {
    employee.opened = !employee.opened;
  }

}
