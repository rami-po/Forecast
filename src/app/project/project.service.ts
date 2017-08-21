import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {DatePipe} from '@angular/common';
import {MainService} from '../main/main.service';
import {isNullOrUndefined} from 'util';

@Injectable()
export class ProjectService {

  public lineChartData: Array<any> = [
    {data: [], label: 'Actual'},
    {data: [], label: 'Forecast'},
    {data: [], label: 'Breakpoint'}
  ];
  public lineChartLabels: Array<any> = [];
  public isDataReady = false;
  public params;
  public weeks;
  public abc = false;

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
      data => {

        // Takes all the separate dates and pools them in their respective Monday's
        const totalCapacities = [];
        for (let i = 0; i < data.result.length; i++) {
          const date = this.datePipe.transform(data.result[i].spent_at, 'MM-dd-yyyy');
          const monday = this.datePipe.transform(this.mainService.getMonday(date), 'MM-dd-yyyy');
          if (totalCapacities[monday] == null) {
            totalCapacities[monday] = 0;
          }
          totalCapacities[monday] += data.result[i].hours;
        }

        let totalCap = 0;
        this.mainService.getResources(this.params).subscribe(
          data => {
            // Cycles through the list now that all the capacities have been pooled, and pushes them to graph arrays
            let l = 0;

            console.log(totalCapacities);

            for (const week in totalCapacities) {
              const forecastCapacity = data.totalCapacities[l];
              totalCap += totalCapacities[week];
              labels.push(week);
              actualData.push(totalCap);
              // Checks to see if date is a non-active forecast date
              if (!isNullOrUndefined(forecastCapacity)) {
                switch (this.datePipe.transform(forecastCapacity.week, 'MM-dd-yyyy')) {
                  case week:
                    const forecastTotalCap = totalCap - totalCapacities[week] + forecastCapacity.capacity;
                    forecastData.push(forecastTotalCap);
                    l++;
                    break;

                  default:
                    forecastData.push(totalCap);
                    break;
                }
              } else {
                forecastData.push(totalCap);
              }
              breakPointData.push(3800);
            }


            // Combines all the actual dates with the forecasted dates
            for (let i = 0; i < this.weeks.length; i++) {
              // this.lineChartLabels.push(this.datePipe.transform(this.weeks[i], 'MM-dd-yyyy'));
              labels.push(this.datePipe.transform(this.weeks[i], 'MM-dd-yyyy'));
            }


            // Cycles through the dates and checks for missing Monday's and adds them if found
            for (let i = 0; i < labels.length - 1; i++) {
              const firstDate = new Date(labels[i]);
              firstDate.setDate(firstDate.getDate() + 7);
              const secondDate = new Date(labels[i + 1]);
              if (firstDate.toDateString() !== secondDate.toDateString()) {
                labels.splice(i + 1, 0, this.datePipe.transform(firstDate, 'MM-dd-yyyy'));
                actualData.splice(i + 1, 0, actualData[i]);
                forecastData.splice(i + 1, 0, actualData[i]);
                breakPointData.splice(i + 1, 0, 3800);
              }
            }

            // Adds forecasted data to graph arrays
            this.mainService.getResources(this.params + '&active=1').subscribe(
              data => {
                for (let i = 0; i < this.weeks.length; i++) {
                  const capacity = data.totalCapacities[i];
                  if (!isNullOrUndefined(capacity) && capacity.week === this.weeks[i]) {
                    forecastData.push(capacity.capacity + totalCap);
                    totalCap += capacity.capacity;
                  } else {
                    forecastData.push(totalCap);
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
