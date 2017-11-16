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
  public totalEmployeeCapacity;
  public totalCapacities;
  public filteredCapacities;
  public isDataAvailable1 = false;
  public isDataAvailable2 = false;
  private subscriptions = [];

  constructor(private forecastService: ForecastService) {
  }

  ngOnInit() {

    console.log('CAPACITY ROW!');

    this.subscriptions.push(this.forecastService.resources$.subscribe(
      data => {
        this.totalCapacities = data;
        this.isDataAvailable1 = true;

      }
    ));

    this.subscriptions.push(this.forecastService.filteredResources$.subscribe(
      data => {
        this.filteredCapacities = data;
        this.isDataAvailable2 = true;
      }
    ));

    this.subscriptions.push(this.forecastService.getTotalCapacities().subscribe(
      data => {
        this.totalEmployeeCapacity = data.result[0].total;
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
    if (!isUndefined(this.filteredCapacities) && !isUndefined(this.filteredCapacities[index]) &&
      this.filteredCapacities[index].week_of.slice(0, 10) === week) {
      return this.filteredCapacities[index].hours;
    }
    return '0';
  }

  getPercentage(week, index) {
    const totalCap = this.getTotalCapacity(week, index);
    const filteredCap = this.getFilteredCapacity(week, index);

    if (totalCap > 0) {
      let val = 0;
      if (this.params.id === '') {
        val = (filteredCap * 100) / this.totalEmployeeCapacity;
      } else {
        val = (filteredCap * 100) / totalCap;
      }
      return `${Math.floor(val)}`;
    }
    return '0';
  }
}
