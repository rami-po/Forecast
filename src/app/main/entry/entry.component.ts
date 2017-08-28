/**
 * Created by Rami Khadder on 8/7/2017.
 */
import {
  AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, Component, Input, OnDestroy,
  OnInit, ViewChild
} from '@angular/core';
import {Entry} from './entry.model';
import {isNullOrUndefined, isUndefined} from 'util';
import {Observable} from 'rxjs/Observable';
import {EntryService} from './entry.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ProjectComponent} from "../../project/project.component";
import {ProjectService} from "../../project/project.service";
import {BaseChartDirective} from "ng2-charts";
import {GraphService} from "../../project/graph/graph.service";
import {MainService} from "../main.service";

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
  @Input() totalCapacities;


  constructor(public entryService: EntryService,
              public graphService: GraphService,
              private mainService: MainService) {
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

  public getCapacity(index): string {
    if (!isNullOrUndefined(this.data) && !isNullOrUndefined(this.data[index])) {
      return this.data[index];
    }

    return '0';
  }

  public getTotal(index): string {
    if (!isNullOrUndefined(this.data) && !isNullOrUndefined(this.data[index])) {
      return this.data[index].capacity;
    }

    return '0';
  }

  type(value: string, week, columnNumber) {

    // this.totalCapacities[0].capacity = 11;

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


        const boxNumber = columnNumber + (this.row * MainService.NUMBER_OF_WEEKS);
        this.entryService.updateResourceManagement(this.entry, week, Number(value), boxNumber).subscribe(
          data => {
            // this.graphService.updateGraph(week);
            this.mainService.getResources('?employeeId=' + this.entry.employeeId).subscribe(
              resources => {
                if (!isUndefined(this.totalCapacities[columnNumber])) {
                  this.totalCapacities[columnNumber].capacity = resources.totalCapacities[columnNumber].capacity;
                } else {
                  this.totalCapacities.push(resources.totalCapacities[columnNumber]);
                }
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
