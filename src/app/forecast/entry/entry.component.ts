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
  @Input() public row;
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
    if (!isNullOrUndefined(this.data[index]) && this.data[index].week === week) {
      return this.data[index].capacity;
    }
    this.data.splice(index, 0, {week: week, capacity: 0});
    return this.data[index].capacity;
  }

  public getTotal(week, index): string {
    if (!isNullOrUndefined(this.totalCapacities[index]) && this.totalCapacities[index].week === week) {
      return this.totalCapacities[index].capacity;
    }
    const color = (this.employeeCapacity === 0 ? 'white' : '#EF9A9A');
    this.totalCapacities.splice(index, 0, {week: week, capacity: (this.params === '' ? 0 : '0 (0)'), color: color});
    return this.totalCapacities[index].capacity;

  }

  getDifference(employeeCap, capacity) {
    return capacity - employeeCap;
  }

  getColor(week, index) {
    if (!isNullOrUndefined(this.totalCapacities)) {
      if (!isNullOrUndefined(this.totalCapacities[index]) && this.totalCapacities[index].week === week) {
        return this.totalCapacities[index].color;
      }
      const color = (this.employeeCapacity === 0 ? 'white' : '#EF9A9A');
      this.totalCapacities.splice(index, 0, {week: week, capacity: (this.params === '' ? 0 : '0 (0)'), color: color});
      return this.totalCapacities[index].color;
    } else {
      // it is an editable cell
      return 'white';
    }
  }


  isYellow(index) {
    if (!isNullOrUndefined(this.totalCapacities[index])) {
      if (this.totalCapacities[index].color === 'yellow') {
        return true;
      }
    }
    return false;
    // const difference = this.getDifference(index);
    // // return ((difference <= 10 && difference > 5) || (difference >= -10 && difference < -5));
    // return difference > 0;
  }

  isRed(index) {
    if (!isNullOrUndefined(this.totalCapacities) && !isNullOrUndefined(this.totalCapacities[index])) {
      if (this.totalCapacities[index].color === 'red') {
        return true;
      }
    }
    return false;
    // const difference = this.getDifference(index);
    // // return (difference > 20 || difference < -20);
    // return difference < 0;
  }

  isDefault(index) {
    if (!isNullOrUndefined(this.totalCapacities) && !isNullOrUndefined(this.totalCapacities[index])) {
      if (this.totalCapacities[index].color === 'default') {
        return true;
      }
    }
    return false;
    // const difference = this.getDifference(index);
    // return difference === 0;
  }

  getTextColor() {
    if (isNullOrUndefined(this.totalCapacities)) {
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

        const boxNumber = columnNumber + (this.row * ForecastService.NUMBER_OF_WEEKS);
        this.entryService.updateResourceManagement(this.entry, week, Number(value), boxNumber).subscribe(
          callback => {
            this.forecastService.getResources('?active=1').subscribe(
              data => {
                this.forecastService.resources.next(data);
              }
            );
            this.forecastService.getResources('?' + this.params.substring(1) + '&active=1').subscribe(
              data => {
                this.forecastService.filteredResources.next(data);
              }
            );

            this.graphService.updateGraph(week);
            this.forecastService.getResources('?employeeId=' + this.entry.employeeId + '&active=1').subscribe(
              resources => {
                for (let i = 0; i < resources.totalCapacities.length; i++) {
                  const difference = this.getDifference(this.employeeCapacity / 3600, resources.totalCapacities[i].capacity);
                  if (difference === 0) {
                    (resources.totalCapacities[i])['color'] = 'white';
                  } else if (difference > 0) {
                    (resources.totalCapacities[i])['color'] = '#FFF59D';
                  } else if (difference < 0) {
                    (resources.totalCapacities[i])['color'] = '#EF9A9A';
                  }
                }

                if (this.params !== '') {
                  this.forecastService.getResources('?employeeId=' + this.entry.employeeId + this.params + '&active=1').subscribe(
                    filteredResources => {
                      const filteredCapacities = filteredResources.totalCapacities;
                      let filteredResourcesIndex = 0;
                      for (let resourcesIndex = 0; resourcesIndex < resources.totalCapacities.length; resourcesIndex++) {
                        if (filteredResourcesIndex < filteredCapacities.length &&
                          resources.totalCapacities[resourcesIndex].week === filteredCapacities[filteredResourcesIndex].week) {
                          resources.totalCapacities[resourcesIndex].capacity =
                            filteredCapacities[filteredResourcesIndex].capacity + ' (' +
                            resources.totalCapacities[resourcesIndex].capacity + ')';
                          filteredResourcesIndex++;
                        }
                      }
                      this.rollUpComponent.totalCapacities = resources.totalCapacities;
                    }
                  );
                } else {
                  this.rollUpComponent.totalCapacities = resources.totalCapacities;
                }

                this.forecastService.getResources('?employeeId=' + this.entry.employeeId +
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
