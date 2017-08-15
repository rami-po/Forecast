/**
 * Created by Rami Khadder on 8/7/2017.
 */
import {
  AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, Component, Input, OnDestroy,
  OnInit
} from '@angular/core';
import {Entry} from './entry.model';
import {isNullOrUndefined} from 'util';
import {Observable} from 'rxjs/Observable';
import {EntryService} from './entry.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
  providers: [EntryService]
})
export class EntryComponent implements OnInit, OnDestroy {

  private static index = 0;
  @Input() public static weeks = [];
  @Input() public static resources: any;
  @Input() public entry: Entry;
  private lastWeek: Date;
  private timerSubscription;

  constructor(
    private entryService: EntryService
  ) { }

  ngOnInit() {

  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this.timerSubscription)) {
      this.timerSubscription.unsubscribe();
    }
  }

  getCapacity(week: Date): string {
    if (!isNullOrUndefined(EntryComponent.resources)) {
      const resource = EntryComponent.resources[EntryComponent.index];
      if (!isNullOrUndefined(resource)) {
        if (resource.employee_id === this.entry.employeeId &&
        resource.client_id === this.entry.clientId &&
        resource.project_id === this.entry.projectId &&
        resource.week_of.substring(0, 10) === week) {
          EntryComponent.index++;
          if (EntryComponent.index === EntryComponent.resources.length) {
            EntryComponent.index = 0;
          }
          return resource.capacity;
        }
      }
    }
    return '';
  }

  getWeeks(): Date[] {
    return EntryComponent.weeks;
  }

  setWeeks(weeks) {
    EntryComponent.weeks = weeks;
  }

  type(value: string, week) {
    if (!isNaN(Number(value))) {
      if (!isNullOrUndefined(this.timerSubscription) && week === this.lastWeek) {
        this.timerSubscription.unsubscribe();
      }
      this.lastWeek = week;
      const timer = Observable.timer(2000);
      this.timerSubscription = timer.subscribe(t => {
        this.entryService.updateResourceManagement(this.entry, week, Number(value)).subscribe();
      });
    }
  }

}
