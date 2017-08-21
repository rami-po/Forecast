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
  private index = 0;
  @Input() public name: string;
  @Input() public client: string;
  @Input() public project: string;
  @Input() public weeks: Date[];
  @Input() public isMain = true;

  constructor() { }

  ngOnInit() {
    this.weeks = EntryComponent.weeks;
    this.index = 0;
  }

  getTotalCapacity(week, i) {
    if (!isNullOrUndefined(HeaderRowComponent.totalCapacities)) {
      const totalCap = HeaderRowComponent.totalCapacities[i];
      if (!isNullOrUndefined(totalCap)) {
        if (totalCap.week === week) {
          return totalCap.capacity;
        }
      }
    }
    return '0';
  }

}
