/**
 * Created by Rami Khadder on 8/22/2017.
 */
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {DatePipe} from '@angular/common';
import {ForecastService} from '../../forecast/forecast.service';
import {isNullOrUndefined} from 'util';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class GraphService {

  private lineChartData = new Subject<Array<any>>();
  lineChartData$ = this.lineChartData.asObservable();
  private lineChartLabels = new Subject<Array<any>>();
  lineChartLabels$ = this.lineChartLabels.asObservable();
  private localLineChartData;
  private localLineChartLabels;
  public params;
  public weeks;
  private budget;

  public test = new Subject<Array<any>>();
  test$ = this.test.asObservable();

  constructor(private http: Http,
              private datePipe: DatePipe,
              private forecastService: ForecastService) {
  }

  updateGraph(week) {
    this.forecastService.getResources('?' + this.params).subscribe(
      data => {
        for (let i = 0; i < data.totalCapacities.length; i++) {
          if (data.totalCapacities[i].week === week) {
            const index = this.localLineChartLabels.indexOf(this.datePipe.transform(week, 'MM-dd-yyyy'));
            console.log(index);
            const dataClone = JSON.parse(JSON.stringify(this.localLineChartData));
            console.log(dataClone[1].data);
            const before = (index !== 0 ? dataClone[1].data[index - 1] : 0)
            const newCap = data.totalCapacities[i].capacity + before - dataClone[1].data[index];
            for (let j = index; j < dataClone[1].data.length; j++) {
              dataClone[1].data[j] += newCap;
            }
            this.lineChartData.next(dataClone);
            this.localLineChartData = dataClone;

          }
        }
      }
    );
  }

  initializeGraph(params) {

    const labels = [];
    const allData = [
      {data: [], label: 'Actual'},
      {data: [], label: 'Forecast'},
      {data: [], label: 'Breakpoint'}
    ];
    const actualData = [];
    const forecastData = [];
    const breakPointData = [];

    this.forecastService.getTimeEntries('?' + params).subscribe(
      timeEntries => {

        console.log(params);
        console.log(timeEntries.result.length);

        console.log('a');

        // !!! this loops needs to be optimized !!!
        // Takes all the separate dates and pools them in their respective Monday's
        const totalCapacities = [];
        const fcTotalCapacities = [];
        for (let i = 0; i < timeEntries.result.length; i++) {
          const date = this.datePipe.transform(timeEntries.result[i].spent_at, 'MM-dd-yyyy');
          const monday = this.datePipe.transform(this.forecastService.getMonday(date), 'MM-dd-yyyy');
          if (totalCapacities[monday] == null) {
            totalCapacities[monday] = 0;
          }
          totalCapacities[monday] += timeEntries.result[i].hours;
        }

        console.log('b');

        let actualCap = 0;
        let forecastCap = 0;
        const index = params.indexOf('project');
        this.forecastService.getProjects('/' + params.substring(index + 10)).subscribe(
          project => {
            this.budget = project.result[0].cost_budget;
            // REMOVE THIS!!
            this.budget = 3800;
            console.log('?' + params);
            this.forecastService.getResources('?' + params).subscribe(
              dataTC => {
                for (const week in totalCapacities) {
                  labels.push(week);
                }

                console.log('c');

                // Combines all the actual dates with the forecasted dates
                for (let i = 0; i < this.weeks.length; i++) {
                  const week = this.datePipe.transform(this.weeks[i], 'MM-dd-yyyy');
                  if (labels.indexOf(week) === -1) {
                    labels.push(week);
                  }
                }

                console.log('d');

                // Cycles through the dates and checks for missing Monday's and adds them if found
                for (let i = 0; new Date(labels[i]).getTime() < new Date(this.datePipe.transform(this.weeks[0], 'MM-dd-yyyy')).getTime(); i++) {
                  const firstDate = new Date(labels[i]);
                  firstDate.setDate(firstDate.getDate() + 7);
                  const secondDate = new Date(labels[i + 1]);

                  if (firstDate.toDateString() !== secondDate.toDateString()) {
                    labels.splice(i + 1, 0, this.datePipe.transform(firstDate, 'MM-dd-yyyy'));
                  }
                }

                console.log('e');

                for (let i = 0; i < dataTC.totalCapacities.length; i++) {
                  fcTotalCapacities[this.datePipe.transform(dataTC.totalCapacities[i].week, 'MM-dd-yyyy')] = dataTC.totalCapacities[i].capacity;
                }

                console.log('f');

                // Adds forecasted data to graph arrays
                this.forecastService.getResources('?' + params + '&active=1').subscribe(
                  resources => {

                    for (let i = 0; new Date(labels[i]).getTime() < new Date(this.datePipe.transform(this.weeks[0], 'MM-dd-yyyy')).getTime(); i++) {
                      actualCap += (!isNullOrUndefined(totalCapacities[labels[i]]) ? totalCapacities[labels[i]] : 0);
                      forecastCap += (!isNullOrUndefined(totalCapacities[labels[i]]) ? totalCapacities[labels[i]] : 0);
                      // forecastCap = (!isNullOrUndefined(fcTotalCapacities[labels[i]]) ? fcTotalCapacities[labels[i]] + forecastCap : forecastCap);
                      actualData.push(actualCap);
                      forecastData.push(forecastCap);
                      breakPointData.push(this.budget);
                    }

                    console.log('g');

                    let index = 0;
                    for (let i = 0; i < this.weeks.length; i++) {
                      const capacity = resources.totalCapacities[index];
                      if (!isNullOrUndefined(capacity) && capacity.week === this.weeks[i]) {
                        forecastCap += capacity.capacity;
                        forecastData.push(forecastCap);
                        index++;
                      } else {
                        forecastData.push(forecastCap);
                      }
                      breakPointData.push(this.budget);
                    }

                    console.log('h');

                    this.lineChartLabels.next(labels);
                    allData[0].data = actualData;
                    allData[1].data = forecastData;
                    allData[2].data = breakPointData;
                    this.lineChartData.next(allData);

                    this.localLineChartLabels = labels;
                    this.localLineChartData = allData;
                  }
                );

              }
            );
          }
        );
      }
    );
  }
}
