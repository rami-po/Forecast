import {Component, Input, OnInit} from '@angular/core';
import {ForecastService} from '../forecast.service';
import {isUndefined} from 'util';

@Component({
  selector: 'app-capacity-row',
  templateUrl: './capacity-row.component.html',
  styleUrls: ['./capacity-row.component.scss']
})
export class CapacityRowComponent implements OnInit {

  @Input() public weeks;
  @Input() public params;
  public totalCapacities;
  public filteredCapacities;
  private subscriptions = [];

  constructor(private forecastService: ForecastService) {
  }

  ngOnInit() {

    this.subscriptions.push(this.forecastService.resources$.subscribe(
      data => {
        this.totalCapacities = data;
      }
    ));

    this.subscriptions.push(this.forecastService.filteredResources$.subscribe(
      data => {
        this.filteredCapacities = data;
      }
    ));
  }

  getTotalCapacity(week, index) {
    if (!isUndefined(this.totalCapacities) && !isUndefined(this.totalCapacities[index]) &&
      this.totalCapacities[index].week_of.slice(0, 10) === week) {
      return this.totalCapacities[index].hours;
    }
    return '0';
  }

  getFilteredCapacity(week, index) {
    if (this.params.id !== '') {
      if (!isUndefined(this.filteredCapacities) && !isUndefined(this.filteredCapacities[index]) &&
        this.filteredCapacities[index].week_of.slice(0, 10) === week) {
        return this.filteredCapacities[index].hours;
      }
      return '0';
    }
    return '0';
  }
}
