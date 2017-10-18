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
  providers: [EntryService]
})
export class EntryComponent implements OnInit, OnDestroy {

  @Input() public static weeks = [];
  private lastWeek;
  public timerSubscription;
  public graphSubscription;
  @Input() public entry: Entry;
  @Input() public forecast;
  @Input() public employeeCapacity;
  @Input() public isOpened = false;
  @Input() private params;
  @Input() public isHeader = false;

  private isSubscribed = false;


  constructor(public entryService: EntryService,
              public graphService: GraphService,
              private forecastService: ForecastService,
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
    if (!isNullOrUndefined(this.forecast.data[index]) && this.forecast.data[index].week_of.slice(0, 10) === week) {
      return this.forecast.data[index].capacity;
    }
    this.forecast.data.splice(index, 0, {
      employee_id: this.entry.employeeId,
      project_id: this.entry.projectId,
      client_id: this.entry.clientId,
      week_of: week,
      capacity: '0'
    });
    return '0';
  }

  public getTotal(week, index) {
    let value = 0;
    let total = 0;
    if (!isNullOrUndefined(this.forecast.totals[index]) && this.forecast.totals[index].week_of.slice(0, 10) === week) {
      total = Number(this.forecast.totals[index].hours);
    } else {
      this.forecast.totals.splice(index, 0, {week_of: week, hours: 0});
    }
    if (this.params.id === '') { // no filter applied
      return total;
    }
    if (!isNullOrUndefined(this.forecast.data[index]) && this.forecast.data[index].week_of.slice(0, 10) === week) {
      value = Number(this.forecast.data[index].capacity);
    } else {
      this.forecast.data.splice(index, 0, {week_of: week, capacity: 0});
    }
    if (total === value) {
      return total;
    }
    return value + ' / ' + total;

  }

  getColor(week, index) {
    if (!this.isHeader) {
      return 'white';
    }
    if (!isNullOrUndefined(this.forecast.totals[index]) && this.forecast.totals[index].week_of.slice(0, 10) === week) {
      if (this.forecast.totals[index].hours < this.employeeCapacity) {
        return '#EF9A9A';
      } else if (this.forecast.totals[index].hours > this.employeeCapacity) {
        return '#FFF59D';
      }
    } else {
      if (0 < this.employeeCapacity) {
        return '#EF9A9A';
      }
    }
    return 'white';
  }

  getTextColor() {
    if (!this.isHeader) {
      return 'rgb(33, 150, 243)';
    }
    return 'black';
  }

  send(value: string, week) {
    if (this.isSubscribed) {

      this.timerSubscription.unsubscribe();
      if (!isNullOrUndefined(this.graphSubscription)) {
        this.graphSubscription.unsubscribe();
      }
      this.isSubscribed = false;

      console.log('sent');

      this.entryService.updateResourceManagement(this.entry, week, Number(value)).subscribe(
        () => {
          this.forecastService.getResources('?active=1&slim=1').subscribe(
            resources => {
              this.forecastService.resources.next(resources.result);
            }
          );
          this.forecastService.getResources('?' + this.params.path + 'Id=' + this.params.id + '&active=1&slim=1').subscribe(
            resources => {
              this.forecastService.filteredResources.next(resources.result);
            }
          );

          // this.graphService.updateGraph(week);
          if (this.params.id !== '') {
            const timer = Observable.timer(2000);
            this.graphSubscription = timer.subscribe(t => {
              this.graphService.initializeGraph(this.params, false);
            });
          }
          this.forecastService.socket.emit('broadcastUpdatedRollUps', {
            id: this.entry.projectId,
            employeeId: this.entry.employeeId
          }); // everyone but the sender gets it
          this.forecastService.getResources('?employeeId=' + this.entry.employeeId + '&active=1&slim=1').subscribe(
            data => {
              for (let i = 0; i < this.forecast.data.length; i++) {
                if (this.forecast.data[i].week_of.slice(0, 10) === week) {
                  this.forecast.data.splice(i, 1, {
                    employee_id: this.entry.employeeId,
                    project_id: this.entry.projectId,
                    client_id: this.entry.clientId,
                    week_of: week,
                    capacity: value
                  });
                  this.rollUpComponent.filteredEntry.totals = data.result;
                  if (this.entry.projectId === Number(this.params.id)) {
                    this.rollUpComponent.filteredEntry.data = this.forecast.data;
                  }
                  break;
                }
              }
            }
          );
        }
      );
    }
  }

  type(value: string, week) {
    console.log('sending...');
    if (!isNaN(Number(value))) {
      if (!isNullOrUndefined(this.timerSubscription) && week === this.lastWeek) {
        console.log('changed...');
        this.timerSubscription.unsubscribe();
        this.isSubscribed = false;
      }
      this.lastWeek = week;
      const timer = Observable.timer(2000);
      this.timerSubscription = timer.subscribe(t => {
        this.send(value, week);
      });
      this.isSubscribed = true;
    } else {
      console.log('not a number...');
    }
  }

  check(entry): boolean {
    return !isNullOrUndefined(entry);
  }

}
