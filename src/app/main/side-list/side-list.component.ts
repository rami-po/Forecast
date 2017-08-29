import {AfterViewInit, Component, HostListener, Input, OnInit} from '@angular/core';
import {Entry} from "../entry/entry.model";
import {MainComponent} from "../main.component";
import {MainService} from "../main.service";
import {EntryComponent} from "../entry/entry.component";
import {isNullOrUndefined} from "util";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-side-list',
  templateUrl: './side-list.component.html',
  styleUrls: ['./side-list.component.scss']
})
export class SideListComponent implements OnInit {

  @Input() public hasProject = true;
  @Input() public entries;
  @Input() public employees;
  public name: string;
  private lastEmployeeId;
  private timerSubscription;

  constructor(private mainService: MainService) {
  }


  ngOnInit() {
    this.mainService.rollUps$.subscribe(
      data => {
        // this.entries = data;
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
