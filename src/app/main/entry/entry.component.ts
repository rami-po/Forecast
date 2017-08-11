/**
 * Created by Rami Khadder on 8/7/2017.
 */
import {Component, Input, OnInit} from '@angular/core';
import {Entry} from './entry.model';
import {isNullOrUndefined} from 'util';
import {Observable} from 'rxjs/Observable';
import {EntryService} from './entry.service';
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
  providers: [EntryService]
})
export class EntryComponent implements OnInit {

  static index = 0;
  @Input() static weeks = [];
  @Input() static capacity: any;
  static array = [];
  @Input()entry: Entry;
  lastWeek: Date;
  timerSubscription;

  constructor(
    private entryService: EntryService
  ) { }

  ngOnInit() {

  }

  getCapacity(week: Date): string {
    if (!isNullOrUndefined(EntryComponent.capacity)) {
      const capacity = EntryComponent.capacity[EntryComponent.index];
      if (!isNullOrUndefined(capacity)) {
        if (capacity.employee_id === this.entry.employeeId &&
        capacity.client_id === this.entry.clientId &&
        capacity.project_id === this.entry.projectId &&
        capacity.week_of === week.toUTCString()) {
          console.log('ay');
          EntryComponent.index++;
          return capacity.capacity;
        }
      }
    }
    /*
    if (!isNullOrUndefined(EntryComponent.capacity)) {
      const i = EntryComponent.index;
      const capacity = EntryComponent.capacity[i];
      if (!isNullOrUndefined(capacity)) {
        /*console.log(capacity.employee_id + ' ' + this.entry.employeeId);
         console.log(capacity.client_id + ' ' + this.entry.clientId);
         console.log(capacity.project_id + ' ' + this.entry.projectId);
         console.log(capacity.week_of + ' ' + week.getUTCDate());
        if (capacity.employee_id === this.entry.employeeId &&
          capacity.client_id === this.entry.clientId &&
          capacity.project_id === this.entry.projectId &&
          capacity.week_of === week.toUTCString()
        ) {
          console.log('ay');
          const x = new BehaviorSubject(capacity.capacity);
          const cap = capacity.capacity;
          x.subscribe(data => {
            return data;
          });
          setTimeout(() => 'a' , 0);
          EntryComponent.array.push(cap);
          EntryComponent.index++;
          return EntryComponent.array[i];
        }
      }
    }*/
  }

  getWeeks(): Date[] {
    return EntryComponent.weeks;
  }

  setWeeks(weeks) {
    EntryComponent.weeks = weeks;
  }

  initialize(week: Date) {
    this.entryService.updateResourceManagement(this.entry, week, null).subscribe();
  }

  yo(ay: string, week: Date) {
    console.log(EntryComponent.array);
    if (!isNaN(Number(ay))) {
      if (!isNullOrUndefined(this.timerSubscription) && week === this.lastWeek) {
        this.timerSubscription.unsubscribe();
      }
      this.lastWeek = week;
      const timer = Observable.timer(5000);
      this.timerSubscription = timer.subscribe(t => {
        console.log(ay);
        this.entryService.updateResourceManagement(this.entry, week, Number(ay)).subscribe(
          data => {

          });
      });
    }
  }

}
