/**
 * Created by Rami Khadder on 8/22/2017.
 */
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {DatePipe} from '@angular/common';
import {MainService} from '../../main/main.service';
import {isNullOrUndefined} from 'util';

@Injectable()
export class GraphService {

  public lineChartData: Array<any> = [
    {data: [], label: 'Actual'},
    {data: [], label: 'Forecast'},
    {data: [], label: 'Breakpoint'}
  ];
  public lineChartLabels: Array<any> = [];
  public params;
  public weeks;

  constructor(
    private http: Http,
    private datePipe: DatePipe,
    private mainService: MainService
  ) { }

  getMembers(params) {
    return this.http.get('http://localhost:3000/resource/member' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getTimeEntries(params) {
    return this.http.get('http://localhost:3000/resource/time' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  updateGraph(week) {
    this.mainService.getResources(this.params).subscribe(
      data => {
        console.log(data);
        for (let i = 0; i < data.totalCapacities.length; i++) {
          if (data.totalCapacities[i].week === week) {
            const index = this.lineChartLabels.indexOf(this.datePipe.transform(week, 'MM-dd-yyyy'));
            const dataClone = JSON.parse(JSON.stringify(this.lineChartData));
            const newCap = data.totalCapacities[i].capacity + dataClone[1].data[index - 1] - dataClone[1].data[index];
            for (let j = index; j < dataClone[1].data.length; j++) {
              dataClone[1].data[j] += newCap;
            }
            this.lineChartData = dataClone;
            break;
          }
        }
      }
    );
  }

  initializeGraph() {

    const labels = [];
    const actualData = [];
    const forecastData = [];
    const breakPointData = [];

    this.getTimeEntries(this.params).subscribe(
      dataTE => {

        // Takes all the separate dates and pools them in their respective Monday's
        const totalCapacities = [];
        const fcTotalCapacities = [];
        for (let i = 0; i < dataTE.result.length; i++) {
          const date = this.datePipe.transform(dataTE.result[i].spent_at, 'MM-dd-yyyy');
          const monday = this.datePipe.transform(this.mainService.getMonday(date), 'MM-dd-yyyy');
          if (totalCapacities[monday] == null) {
            totalCapacities[monday] = 0;
          }
          totalCapacities[monday] += dataTE.result[i].hours;
        }

        let actualCap = 0;
        let forecastCap = 0;
        this.mainService.getResources(this.params).subscribe(
          dataTC => {

            for (const week in totalCapacities) {
              labels.push(week);
            }

            // Combines all the actual dates with the forecasted dates
            for (let i = 0; i < this.weeks.length; i++) {
              labels.push(this.datePipe.transform(this.weeks[i], 'MM-dd-yyyy'));
            }

            // Cycles through the dates and checks for missing Monday's and adds them if found
            for (let i = 0; i < labels.length - 1; i++) {
              const firstDate = new Date(labels[i]);
              firstDate.setDate(firstDate.getDate() + 7);
              const secondDate = new Date(labels[i + 1]);
              if (firstDate.toDateString() !== secondDate.toDateString()) {
                labels.splice(i + 1, 0, this.datePipe.transform(firstDate, 'MM-dd-yyyy'));
              }
            }

            for (let i = 0; i < dataTC.totalCapacities.length; i++) {
              fcTotalCapacities[this.datePipe.transform(dataTC.totalCapacities[i].week, 'MM-dd-yyyy')] = dataTC.totalCapacities[i].capacity;
            }

            // Adds forecasted data to graph arrays
            this.mainService.getResources(this.params + '&active=1').subscribe(
              dataR => {

                for (let i = 0; new Date(labels[i]).getTime() < new Date(this.datePipe.transform(this.weeks[0], 'MM-dd-yyyy')).getTime(); i++) {
                  actualCap += (!isNullOrUndefined(totalCapacities[labels[i]]) ? totalCapacities[labels[i]] : 0);
                  forecastCap += (!isNullOrUndefined(totalCapacities[labels[i]]) ? totalCapacities[labels[i]] : 0);
                  forecastCap = (!isNullOrUndefined(fcTotalCapacities[labels[i]]) ? fcTotalCapacities[labels[i]] + forecastCap : forecastCap);
                  actualData.push(actualCap);
                  forecastData.push(forecastCap);
                  breakPointData.push(3800);
                }
                for (let i = 0; i < this.weeks.length; i++) {
                  const capacity = dataR.totalCapacities[i];
                  if (!isNullOrUndefined(capacity) && capacity.week === this.weeks[i]) {
                    forecastCap += capacity.capacity;
                    forecastData.push(forecastCap);
                  } else {
                    forecastData.push(forecastCap);
                  }
                  breakPointData.push(3800);
                }

                this.lineChartLabels = labels;
                this.lineChartData[0].data = actualData;
                this.lineChartData[1].data = forecastData;
                this.lineChartData[2].data = breakPointData;
              }
            );

          }
        );
      }
    );
  }
}
