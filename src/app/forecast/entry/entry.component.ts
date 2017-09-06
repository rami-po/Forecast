/**
 * Created by Rami Khadder on 8/7/2017.
 */
import {
  AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, Input,
  OnDestroy,
  OnInit, ViewChild
} from '@angular/core';
import {Entry} from './entry.model';
import {isNullOrUndefined, isUndefined} from 'util';
import {Observable} from 'rxjs/Observable';
import {EntryService} from './entry.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ProjectComponent} from '../../project/project.component';
import {ProjectService} from '../../project/project.service';
import {BaseChartDirective} from 'ng2-charts';
import {GraphService} from '../../project/graph/graph.service';
import {ForecastService} from '../forecast.service';
import {Subject} from 'rxjs/Subject';
import {RollUpComponent} from '../roll-up/roll-up.component';
import {RollUpService} from '../roll-up/roll-up.service';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
  providers: [EntryService, RollUpService]
})
export class EntryComponent implements OnInit, OnDestroy {

  @Input() public static weeks = [];
  private lastWeek;
  public timerSubscription;
  @Input() public entry: Entry;
  @Input() public data;
  @Input() public row;
  @Input() public totalCapacities;
  @Input() public employeeCapacity;
  @Input() public isOpened = false;
  @Input() private params;

  constructor(public entryService: EntryService,
              public graphService: GraphService,
              private mainService: ForecastService,
              private rollUpComponent: RollUpComponent,
              private rollUpService: RollUpService) {
  }

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

  public getCapacity(week, index): string {
    if (!isNullOrUndefined(this.data) && !isNullOrUndefined(this.data[index])) {
      if (this.data[index].week === week) {
        return this.data[index].capacity;
      } else {
        this.data.splice(index, 0, {week: week, capacity: 0});
        return this.data[index].capacity;
      }
    }
    return '0';
  }

  public getTotal(week, index): string {
    if (!isNullOrUndefined(this.totalCapacities) && !isNullOrUndefined(this.totalCapacities[index])) {
      if (this.totalCapacities[index].week === week) {
        return this.totalCapacities[index].capacity;
      } else {
        this.totalCapacities.splice(index, 0, {week: week, capacity: 0});
        return this.totalCapacities[index].capacity;
      }
    }
    return '0';
  }

  getDifference(index): any {
    const employeeCap = this.employeeCapacity / 3600;
    if (!isNullOrUndefined(this.totalCapacities) && !isNullOrUndefined(this.totalCapacities[index])) {
      return this.totalCapacities[index].capacity - employeeCap;
    }
    return 0 - employeeCap;
  }

  isGreen(index) {
    const difference = this.getDifference(index);
    return (difference === 0);
  }

  isLime(index) {
    const difference = this.getDifference(index);
    return ((difference <= 5 && difference > 0) || (difference >= -5 && difference < 0));
  }

  isYellow(index) {
    const difference = this.getDifference(index);
    // return ((difference <= 10 && difference > 5) || (difference >= -10 && difference < -5));
    return difference > 0;
  }

  isOrange(index) {
    const difference = this.getDifference(index);
    return ((difference <= 20 && difference > 10) || (difference >= -20 && difference < -10));
  }

  isRed(index) {
    const difference = this.getDifference(index);
    // return (difference > 20 || difference < -20);
    return difference < 0;
  }

  isDefault(index) {
    const difference = this.getDifference(index);
    return difference === 0;
  }

  type(value: string, week, columnNumber) {
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

        const boxNumber = columnNumber + (this.row * ForecastService.NUMBER_OF_WEEKS);
        this.entryService.updateResourceManagement(this.entry, week, Number(value), boxNumber).subscribe(
          callback => {
            this.mainService.getResources('?active=1').subscribe(
              data => {
                this.mainService.resources.next(data);
              }
            );
            this.mainService.getResources('?' + this.params.substring(1) + '&active=1').subscribe(
              data => {
                this.mainService.filteredResources.next(data);
              }
            );

            this.graphService.updateGraph(week);
            this.mainService.getResources('?employeeId=' + this.entry.employeeId + '&active=1').subscribe(
              resources => {
                this.rollUpComponent.totalCapacities = resources.totalCapacities;
                this.mainService.getResources('?employeeId=' + this.entry.employeeId +
                  '&projectId=' + this.entry.projectId + '&active=1').subscribe(
                  data => {
                    this.data.length = 0;
                    for (let i = 0; i < data.result.length; i++) {
                      this.data.push({
                        week: data.result[i].week_of.substring(0, 10),
                        capacity: data.result[i].capacity
                      });
                    }
                  }
                );
              }
            );
          }
        );
      });
    } else {
      console.log('not a number...');
    }
  }

  check(entry): boolean {
    return !isNullOrUndefined(entry);
  }

}
