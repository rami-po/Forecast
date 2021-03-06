import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {isNullOrUndefined} from 'util';
import {EntryComponent} from '../entry/entry.component';
import {ForecastComponent} from "../forecast.component";
import {ForecastService} from "../forecast.service";
import {forEach} from "@angular/router/src/utils/collection";

@Component({
  selector: 'app-header-row',
  templateUrl: './header-row.component.html',
  styleUrls: ['./header-row.component.scss']
})
export class HeaderRowComponent implements OnInit, OnDestroy {

  private totalCapacities: any;
  private index = 0;
  @Input() public name: string;
  @Input() public client: string;
  @Input() public project: string;
  @Input() public weeks;
  @Input() public isMain = true;
  private subscriptions = [];

  constructor(
    private mainService: ForecastService
  ) { }

  ngOnInit() {
    this.index = 0;
  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  getTotalCapacity(week) {
    if (!isNullOrUndefined(this.totalCapacities)) {
      const totalCap = this.totalCapacities[this.index];
      if (!isNullOrUndefined(totalCap)) {
        if (totalCap.week === week) {
          this.index++;
          if (this.index === this.totalCapacities.length) {
            this.index = 0;
          }
          return totalCap.capacity;

        }
      }
    }
    return '0';
  }

}
