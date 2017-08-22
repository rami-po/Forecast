/**
 * Created by Rami Khadder on 8/7/2017.
 */
import {
  AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, Component, Input, OnDestroy,
  OnInit, ViewChild
} from '@angular/core';
import {Entry} from './entry.model';
import {isNullOrUndefined} from 'util';
import {Observable} from 'rxjs/Observable';
import {EntryService} from './entry.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ProjectComponent} from "../../project/project.component";
import {ProjectService} from "../../project/project.service";
import {BaseChartDirective} from "ng2-charts";
import {GraphService} from "../../project/graph/graph.service";

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
  providers: [EntryService]
})
export class EntryComponent implements OnInit, OnDestroy {

  @Input() public static resources;
  @Input() public static weeks = [];
  private static index = 0;
  private lastWeek;
  public timerSubscription;
  @Input() public entry: Entry;


  constructor(
    public entryService: EntryService,
    public graphService: GraphService
  ) { }

  ngOnInit() {

  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this.timerSubscription)) {
      this.timerSubscription.unsubscribe();
    }
  }

  getWeeks(): Date[] {
    return EntryComponent.weeks;
  }

  static setWeeks(weeks) {
    EntryComponent.weeks = weeks;
  }

  public getCapacity(week: Date): string {
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

  type(value: string, week) {
    console.log('sending...');
    if (!isNaN(Number(value))) {
      if (!isNullOrUndefined(this.timerSubscription) && week === this.lastWeek) {
        console.log('changed...');
        this.timerSubscription.unsubscribe();
      }
      this.lastWeek = week;
      const timer = Observable.timer(2000);
      this.timerSubscription = timer.subscribe(t => {
        console.log('sent');
        this.entryService.updateResourceManagement(this.entry, week, Number(value)).subscribe(
          data => {
            this.graphService.updateGraph(week);
          }
        );
      });
    } else {
      console.log('not a number...');
    }
  }

}
