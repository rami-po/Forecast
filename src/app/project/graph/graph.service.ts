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
    if (!isNullOrUndefined(this.localLineChartData)) {
      this.forecastService.getResources('?' + this.params + '&active=1&cost=1').subscribe(
        data => {
          for (let i = 0; i < data.totalCapacities.length; i++) {
            if (data.totalCapacities[i].week === week) {
              const index = this.localLineChartLabels.indexOf(this.datePipe.transform(week, 'MM-dd-yyyy'));
              const dataClone = JSON.parse(JSON.stringify(this.localLineChartData));
              const before = (index !== 0 ? dataClone[1].data[index - 1] : 0);
              const newCap = data.totalCapacities[i].cost + before - dataClone[1].data[index];
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
  }

  parse(projectNotes): any {
    projectNotes += '\n[';
    const data = [];

    const arrayWeekAndBudget = projectNotes.match(/\[(.*?)]/g);
    const arrayNotes = projectNotes.match(/]([\s\S]*?)\[/g);

    if (!isNullOrUndefined(arrayWeekAndBudget) &&
        !isNullOrUndefined(arrayNotes) && arrayWeekAndBudget.length === arrayNotes.length) {
      for (let i = 0; i < arrayWeekAndBudget.length; i++) {
        const weekAndBudget = arrayWeekAndBudget[i].substring(1, arrayWeekAndBudget[i].length - 1);
        const colonIndex = weekAndBudget.indexOf(':');
        const notes = arrayNotes[i].substring(2, arrayNotes[i].length - 2);
        const date = new Date(weekAndBudget.substring(0, colonIndex));
        data.push({
          endWeek: this.datePipe.transform(this.forecastService.getMonday(date), 'MM-dd-yyyy'),
          budget: weekAndBudget.substring(colonIndex + 2).replace(/,/, ''),
          notes: notes
        });
      }
    }
    return data;
  }

  initializeGraph(params) {

    const labels = [];
    const allData = [
      {data: [], label: 'Actual'},
      {data: [], label: 'Forecast'}
    ];
    const actualData = [];
    const forecastData = [];
    const breakPointData = [];

    console.log(params);

    // this.forecastService.getEmployees('?' + params).subscribe(
    //   employeesData => {
    //     const employees = employeesData.result;
    //     for (const employee of employees) {
    //       console.log('?' + params + '&userid=' + employee.id);
    //       this.forecastService.getTimeEntries('?' + params + '&userid=' + employee.id).subscribe(
    //         timeEntriesData => {
    //           console.log(timeEntriesData.result);
    //         }
    //       );
    //     }
    //   }
    // );

    this.forecastService.getTimeEntries('?' + params).subscribe(
      timeEntries => {
        console.log(timeEntries);

        console.log('a');

        // !!! this loops needs to be optimized !!!
        const totalCapacities = [];
        const fcTotalCapacities = [];
        for (let i = 0; i < timeEntries.result.length; i++) {
          const date = this.datePipe.transform(timeEntries.result[i].spent_at, 'MM-dd-yyyy');
          const monday = this.datePipe.transform(this.forecastService.getMonday(date), 'MM-dd-yyyy');
          if (totalCapacities[monday] == null) {
            totalCapacities[monday] = 0;
          }
          totalCapacities[monday] += timeEntries.result[i].hours * timeEntries.result[i].cost;
        }

        console.log('b');

        let actualCap = 0;
        let forecastCap = 0;
        const index = params.indexOf('project');
        this.forecastService.getProjects('/' + params.substring(index + 10)).subscribe(
          project => {
            const budgetData = this.parse(project.result[0].notes);
            this.budget = project.result[0].cost_budget;
            console.log(budgetData);
            // REMOVE THIS!!
            // this.budget = 3800;
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

                // Cycles through the dates and checks for missing Mondays and adds them if found
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
                this.forecastService.getResources('?' + params + '&active=1&cost=1').subscribe(
                  resources => {

                    breakPointData.push([]);
                    let budgetIndex = 0;
                    for (let i = 0; new Date(labels[i]).getTime() < new Date(this.datePipe.transform(this.weeks[0], 'MM-dd-yyyy')).getTime(); i++) {
                      actualCap += (!isNullOrUndefined(totalCapacities[labels[i]]) ? totalCapacities[labels[i]] : 0);
                      forecastCap += (!isNullOrUndefined(totalCapacities[labels[i]]) ? totalCapacities[labels[i]] : 0);
                      // forecastCap = (!isNullOrUndefined(fcTotalCapacities[labels[i]]) ? fcTotalCapacities[labels[i]] + forecastCap : forecastCap);
                      actualData.push(actualCap);
                      forecastData.push(forecastCap);
                      const endWeek = (!isNullOrUndefined(budgetData[budgetIndex]) ? new Date(budgetData[budgetIndex].endWeek) : null);
                      if (!isNullOrUndefined(endWeek) && endWeek.getTime() > new Date(labels[i]).getTime()) {
                        breakPointData[budgetIndex].push(Number(budgetData[budgetIndex].budget));
                      }

                      if (!isNullOrUndefined(endWeek) && endWeek.getTime() === new Date(labels[i]).getTime()) {
                        budgetIndex++;
                        breakPointData.push([]);
                        for (let j = 0; j < breakPointData[budgetIndex - 1].length; j++) {
                          breakPointData[budgetIndex].push(null);
                        }
                        if (!isNullOrUndefined(budgetData[budgetIndex])) {
                          breakPointData[budgetIndex - 1].push(Number(budgetData[budgetIndex].budget));
                        }

                      }
                    }

                    console.log('g');

                    let index = 0;
                    for (let i = 0; i < this.weeks.length; i++) {
                      const capacity = resources.totalCapacities[index];
                      if (!isNullOrUndefined(capacity) && capacity.week === this.weeks[i]) {
                        forecastCap += capacity.cost;
                        forecastData.push(forecastCap);
                        index++;
                      } else {
                        forecastData.push(forecastCap);
                      }
                      const endWeek = (!isNullOrUndefined(budgetData[budgetIndex]) ? new Date(budgetData[budgetIndex].endWeek) : null);
                      if (!isNullOrUndefined(endWeek) && endWeek.getTime() > new Date(labels[i]).getTime()) {
                        breakPointData[budgetIndex].push(Number(budgetData[budgetIndex].budget));
                      }
                      if (!isNullOrUndefined(endWeek) && endWeek.getTime() === new Date(this.weeks[i]).getTime()) {
                        budgetIndex++;
                        breakPointData.push([]);
                        for (let j = 0; j < breakPointData[budgetIndex - 1].length; j++) {
                          breakPointData[budgetIndex].push(null);
                        }
                        if (!isNullOrUndefined(budgetData[budgetIndex])) {
                          breakPointData[budgetIndex - 1].push(Number(budgetData[budgetIndex].budget));
                        }
                      }
                    }

                    console.log('h');

                    this.lineChartLabels.next(labels);
                    allData[0].data = actualData;
                    allData[1].data = forecastData;
                    for (let i = breakPointData.length - 1; i >= 0; i--) {
                      if (breakPointData[i].length > 0) {
                        allData.push({data: breakPointData[i], label: budgetData[i].notes});
                      }
                    }
                    // allData[2].data = breakPointData;
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
