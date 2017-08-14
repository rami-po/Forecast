import {Component, Input, OnInit} from '@angular/core';
import {isNullOrUndefined} from 'util';
import {EntryComponent} from '../entry/entry.component';
import {MainComponent} from "../main.component";

@Component({
  selector: 'app-header-row',
  templateUrl: './header-row.component.html',
  styleUrls: ['./header-row.component.scss']
})
export class HeaderRowComponent implements OnInit {

  @Input() public static totalCapacities: any;
  private static index = 0;
  @Input() public name: string;
  @Input() public client: string;
  @Input() public project: string;
  @Input() public weeks: Date[];

  constructor() { }

  ngOnInit() {
    this.weeks = EntryComponent.weeks;
  }

  getTotalCapacity(week) {
    if (!isNullOrUndefined(HeaderRowComponent.totalCapacities)) {
      const totalCap = HeaderRowComponent.totalCapacities[HeaderRowComponent.index];
      if (!isNullOrUndefined(totalCap)) {
        if (totalCap.week === week) {
          HeaderRowComponent.index++;
          if (HeaderRowComponent.index === HeaderRowComponent.totalCapacities.length) {
            HeaderRowComponent.index = 0;
          }
          return totalCap.capacity;
        }
      }
    }
    return '0';
  }

}
