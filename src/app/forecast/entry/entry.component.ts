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
  @Input() public entry: Entry;
  @Input() public data;
  @Input() public forecast;
  @Input() public row;
  @Input() public test;
  @Input() public totalCapacities;
  @Input() public filteredCapacities;
  @Input() public employeeCapacity;
  @Input() public isOpened = false;
  @Input() private params;


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
    if (!isNullOrUndefined(this.test[index]) && this.test[index].week_of.slice(0, 10) === week) {
      value = this.test[index].hours;
    } else {
      this.test.splice(index, 0, {week_of: week, hours: 0});
    }
    if (this.params.id !== '') {
      if (value === this.employeeCapacity) {
        return value;
      }
      return value + ' / ' + this.employeeCapacity;
    }
    return value;
  }

  getColor(week, index) {
    if (isNullOrUndefined(this.test)) {
      return 'white';
    }
    if (!isNullOrUndefined(this.test[index]) && this.test[index].week_of.slice(0, 10) === week) {
      if (this.test[index].hours < this.employeeCapacity) {
        return '#EF9A9A';
      } else if (this.test[index].hours > this.employeeCapacity) {
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
    if (isNullOrUndefined(this.test)) {
      return 'rgb(33, 150, 243)';
    }
    return 'black';
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
              this.graphService.initializeGraph(this.params);
            }
            this.forecastService.socket.emit('broadcastUpdatedRollUps', { id: this.entry.projectId, employeeId: this.entry.employeeId }); // everyone but the sender gets it
            this.forecastService.getResources('?employeeId=' + this.entry.employeeId + '&active=1&slim=1').subscribe(
              data => {
                this.rollUpComponent.headerData = data.result;
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
