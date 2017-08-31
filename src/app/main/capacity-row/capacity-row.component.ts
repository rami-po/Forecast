import {Component, Input, OnInit} from '@angular/core';
import {MainService} from "../main.service";
import {isUndefined} from "util";

@Component({
  selector: 'app-capacity-row',
  templateUrl: './capacity-row.component.html',
  styleUrls: ['./capacity-row.component.scss']
})
export class CapacityRowComponent implements OnInit {

  @Input() public weeks;
  public totalCapacities;
  public filteredCapacities;
  private subscriptions = [];

  constructor(private mainService: MainService) {
  }

  ngOnInit() {
    this.mainService.getResources('').subscribe(
      data => {
        this.mainService.resources.next(data);
      }
    );

    this.subscriptions.push(this.mainService.resources$.subscribe(
      data => {
        console.log(data.totalCapacities);
        this.totalCapacities = data.totalCapacities;
      }
    ));

    this.subscriptions.push(this.mainService.filteredResources$.subscribe(
      data => {
        console.log(data.totalCapacities);
        this.filteredCapacities = data.totalCapacities;
      }
    ));
  }

  getTotalCapacity(week, index) {
    if (!isUndefined(this.totalCapacities) && !isUndefined(this.totalCapacities[index])) {
      if (this.totalCapacities[index].week !== week) {
        this.totalCapacities.splice(index, 0, {week: week, capacity: 0});
      }
      return this.totalCapacities[index].capacity;
    }
    return '0';
  }

  getFilteredCapacity(week, index) {
    if (!isUndefined(this.filteredCapacities) && !isUndefined(this.filteredCapacities[index])) {
      if (this.filteredCapacities[index].capacity === this.totalCapacities[index].capacity) {
        return '0';
      }
      if (this.filteredCapacities[index].week !== week) {
        this.filteredCapacities.splice(index, 0, {week: week, capacity: 0});
      }
      return this.filteredCapacities[index].capacity;
    }
    return '0';
  }
}
