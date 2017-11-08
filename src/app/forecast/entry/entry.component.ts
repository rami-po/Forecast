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
  providers: [EntryService, RollUpComponent]
})
export class EntryComponent implements OnInit, OnDestroy {

  @Input() public static weeks = [];
  private lastWeek;
  public timerSubscription;
  public graphSubscription;
  public messageSubscription;
  @Input() public entry: Entry;
  @Input() public forecast;
  @Input() public employeeCapacity;
  @Input() public isOpened = false;
  @Input() public params;
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

  getColor2(week, index) {
    if (this.isHeader) {
      return 'white';
    }
    if (!isNullOrUndefined(this.forecast.data[index]) && this.forecast.data[index].week_of.slice(0, 10) === week) {

      if (this.forecast.data[index].capacity < this.forecast.data[0].capacity) {
        return '#EF9A9A';
      } else if (this.forecast.data[index].capacity > this.forecast.data[0].capacity) {
        return '#FFF59D';
      }
    } else {
      if (0 < this.forecast.data[0].capacity) {
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
      if (!isNullOrUndefined(this.messageSubscription)) {
        this.messageSubscription.unsubscribe();
      }
      this.isSubscribed = false;

      console.log('sent');

      this.entryService.updateResourceManagement(this.entry, week, Number(value), this.params.path, this.params.id).subscribe(
        resources => {
          console.log('updatedEntry'); console.log(resources);
          this.forecastService.resources.next(resources.overallHoursData);
          if (this.params.path === 'client') {
            this.forecastService.filteredResources.next(resources.clientHoursData);
          } else if (this.params.path === 'project') {
            this.forecastService.filteredResources.next(resources.projectHoursData);
            // moved from below where we just checked for an id being present
            // this.graphService.initializeGraph(this.params, false);
          }


          // this.graphService.updateGraph(week);
          if (this.params.id !== '') {
            console.log('mhm');
            const timer = Observable.timer(2000);
            this.graphSubscription = timer.subscribe(t => {
              console.log('entry.component.ts send: initializeGraph:');
              this.graphService.initializeGraph(this.params, false);
            });
          }

          const messageTimer = Observable.timer(2000);
          this.messageSubscription = messageTimer.subscribe(t => {
            console.log('send an updateEntry message');
            const message = {
              action: 'updateEntry',
              clientId: this.entry.clientId,
              projectId: this.entry.projectId,
              employeeId: this.entry.employeeId,
              pageId: this.params.id
            };
            this.forecastService.socket.emit('broadcastUpdatedRollUps', message); // everyone but the sender gets it
          });

          for (let i = 0; i < this.forecast.data.length; i++) {
            if (this.forecast.data[i].week_of.slice(0, 10) === week) {
              this.forecast.data.splice(i, 1, {
                employee_id: this.entry.employeeId,
                project_id: this.entry.projectId,
                client_id: this.entry.clientId,
                week_of: week,
                capacity: value
              });
              // View by Projects has a different header data
              if (this.params.path === '/projects') {
                this.forecastService.getProjectRowData(this.entry.projectId).subscribe(
                  data => {
                    this.rollUpComponent.filteredEntry.totals = data.result;
                  }
                );
              } else {
                this.rollUpComponent.filteredEntry.totals = resources.employeeData;
              }
              if (this.entry.projectId === Number(this.params.id)) {
                this.rollUpComponent.filteredEntry.data = this.forecast.data;
              }
              break;
            }
          }

          /*
          this.forecastService.getResources('?employee_id=' + this.entry.employeeId + '&active=1&slim=1').subscribe(
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
          */
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
