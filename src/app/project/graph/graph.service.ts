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
      let lastBudget = 0;
      for (let i = 0; i < arrayWeekAndBudget.length; i++) {
        const weekAndBudget = arrayWeekAndBudget[i].substring(1, arrayWeekAndBudget[i].length - 1);
        const colonIndex = weekAndBudget.indexOf(':');
        const budget = Number(weekAndBudget.substring(colonIndex + 2).replace(/,/, ''));
        const notes = arrayNotes[i].substring(2, arrayNotes[i].length - 2).replace(/(?:\r\n|\r|\n)/g, ' | ');
        const date = new Date(weekAndBudget.substring(0, colonIndex));
        data.push({
          endWeek: this.forecastService.getMonday(date).toISOString().slice(0, 10),
          budget: budget + lastBudget,
          notes: notes
        });
        lastBudget = budget;
      }
    }
    return data;
  }

  loop(totalCapacities, i, timeEntries, employees, callback) {

    const date = this.datePipe.transform(timeEntries[i].spent_at, 'MM-dd-yyyy');
    const monday = this.forecastService.getMonday(date);
    const employee = employees[timeEntries[i].user_id];

    if (employee != null) {
      if (totalCapacities[monday.toISOString().slice(0, 10) + '//' + timeEntries[i].user_id] == null) {
        const sunday = new Date(monday.getDate() + 6);
        totalCapacities[monday.toISOString().slice(0, 10) + '//' + timeEntries[i].user_id] = {
          id: employee.id,
          week: monday.toISOString().slice(0, 10),
          cost: employee.cost,
          hours: timeEntries[i].hours,
          capacity: employee.capacity / 3600
        };
        i += 1;
        if (i < timeEntries.length) {
          this.loop(totalCapacities, i, timeEntries, employees, callback);
        } else {
          callback(totalCapacities);
        }

      } else {
        totalCapacities[monday.toISOString().slice(0, 10) + '//' + timeEntries[i].user_id].hours += timeEntries[i].hours;
        i += 1;
        if (i < timeEntries.length) {
          this.loop(totalCapacities, i, timeEntries, employees, callback);
        } else {
          callback(totalCapacities);
        }
      }
    }
  }

  getDateOfISOWeek(w, y) {
    const simple = new Date(y, 0, 1 + (w - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
  }

  initializeGraph(params) {
    const labels = [];
    const allData = [
      {data: [], label: 'Cost (Forecast)'},
      {data: [], label: 'Cost (Actual)'},
      {data: [], label: 'Revenue (Forecast)'},
      {data: [], label: 'Revenue (Actual)'}
    ];

    console.log(params);

    this.forecastService.getEmployees('?projectId=' + params.id).subscribe(
      employees => {
        employees = employees.result;
        const body = {employees: employees, projectId: params.id};
        this.forecastService.getGraphData('?all=1', JSON.stringify(body)).subscribe(
          allGraphData => {
            allGraphData = allGraphData.result;
            const forecastGraphData = allGraphData.forecast;
            this.forecastService.getGraphData('', JSON.stringify(body)).subscribe(
              projectData => {
                projectData = projectData.result;
                const forecastProjectData = projectData.forecast;
                this.forecastService.getProjects('/' + body.projectId).subscribe(
                  project => {
                    const budgetData = this.parse(project.result[0].notes);
                    const revenueData = [];
                    const costData = [];
                    // const forecastRevenueData = [];
                    let cost = 0;
                    let revenue = 0;
                    // let forecastRevenue = 0;

                    // for (let i = 0; i < forecastGraphData.length; i++) {
                    //   const week = allGraphData[i].week_of.split('-');
                    //   const ISOWeek = this.getDateOfISOWeek(week[1], week[0]).toISOString().slice(0, 10);
                    //
                    //   if (forecastGraphData[i].hours >= forecastGraphData[i].capacity) {
                    //     forecastRevenue += (forecastProjectData[i].hours / forecastGraphData[i].hours) * forecastGraphData[i].capacity * 20;
                    //   } else {
                    //     forecastRevenue += forecastProjectData[i].hours * 20;
                    //   }
                    //   forecastRevenue[ISOWeek] = forecastRevenue;
                    // }
                    // console.log(forecastRevenue);

                    for (let i = 0; i < allGraphData.length; i++) {
                      const week = allGraphData[i].week_of.split('-');
                      const ISOWeek = this.getDateOfISOWeek(week[1], week[0]).toISOString().slice(0, 10);

                      if (allGraphData[i].hours >= allGraphData[i].capacity) {
                        cost += (projectData[i].hours / allGraphData[i].hours) * 20;
                        revenue += (projectData[i].hours / allGraphData[i].hours) * allGraphData[i].capacity * 20;

                      } else {
                        cost += (projectData[i].hours / projectData[i].capacity) * 20;
                        revenue += projectData[i].hours * 20;

                      }
                      revenueData[ISOWeek] = revenue;
                      costData[ISOWeek] = cost;
                    }
                    if (budgetData.length > 0) {
                      allData.push({data: [], label: budgetData[0].notes});
                    }
                    let budgetKey = 4;
                    for (const key in revenueData) {
                      if (revenueData.hasOwnProperty(key)) {
                        labels.push(this.datePipe.transform(key, 'MM-dd-yyyy'));
                        // ACTUAL AND FORECAST DATA
                        if (key < this.weeks[0]) { // actual
                          allData[3].data.push(revenueData[key]);
                          allData[1].data.push(costData[key]);
                          allData[2].data.push(null);
                          allData[0].data.push(null);
                        } else if (key === this.weeks[0]) { // both
                          allData[3].data.push(revenueData[key]);
                          allData[1].data.push(costData[key]);
                          allData[2].data.push(revenueData[key]);
                          allData[0].data.push(costData[key]);
                        } else if (key > this.weeks[0]) { // forecast
                          allData[2].data.push(revenueData[key]);
                          allData[0].data.push(costData[key]);
                        }

                        // BREAKPOINT DATA
                        if (budgetKey - 4 < budgetData.length) {
                          allData[budgetKey].data.push(budgetData[budgetKey - 4].budget);
                          if (budgetData[budgetKey - 4].endWeek === key) {
                            budgetKey++;
                            if (budgetKey - 4 < budgetData.length) {
                              allData.push({
                                data: JSON.parse(JSON.stringify(allData[budgetKey - 1].data)),
                                label: budgetData[budgetKey - 4].notes
                              });
                            }
                          }
                        }
                      }
                    }
                    this.lineChartLabels.next(labels);
                    this.lineChartData.next(allData);

                  }
                );
              }
            );
          }
        );
      }
    );

    // const labels = [];
    // const allData = [
    //   {data: [], label: 'Actual'},
    //   {data: [], label: 'Forecast'}
    // ];
    // const actualData = [];
    // const forecastData = [];
    // const breakPointData = [];
    //
    // console.log(params);
    //
    // this.forecastService.getProjects('/' + params.slice(0, 10) + '/start').subscribe(
    //   time => {
    //     console.log(time.start);
    //     this.forecastService.getEmployees('?' + params).subscribe(
    //       employeesData => {
    //         employeesData = employeesData.result;
    //         this.forecastService.getAssignments('?' + params).subscribe(
    //           assignments => {
    //             assignments = assignments.result;
    //             this.forecastService.getAllTimeEntries('?' + params).subscribe(
    //               timeEntries => {
    //                 const employees = [];
    //                 for (let i = 0; i < employeesData.length; i++) {
    //                   const employee = employeesData[i];
    //                   employees[employee.id] = employee;
    //                   employees[employee.id].cost = assignments[i].hourly_rate;
    //                 }
    //                 this.loop([], 0, timeEntries.result, employees,
    //                   (graphData) => {
    //                     console.log(graphData);
    //                     console.log(graphData.length);
    //                     let totalHours = 0;
    //                     console.log(this.weeks[0]);
    //                     for (const key in graphData) {
    //                       if (graphData.hasOwnProperty(key)) {
    //                         const point = graphData[key];
    //                         if (point.week > this.weeks[0]) { // it is forecasted
    //                           totalHours += point.hours;
    //                           forecastData.push(totalHours);
    //                           actualData.push(null);
    //                         } else if (point.week === this.weeks[0]) {
    //                           totalHours += point.hours;
    //                           forecastData.push(totalHours);
    //                           actualData.push(totalHours);
    //                         } else { // it is actual
    //                           totalHours += point.hours;
    //                           actualData.push(totalHours);
    //                           forecastData.push(null);
    //                         }
    //                         labels.push(point.week);
    //
    //                         this.lineChartLabels.next(labels);
    //                         allData[0].data = actualData;
    //                         allData[1].data = forecastData;
    //
    //                         this.lineChartData.next(allData);
    //
    //                         this.localLineChartLabels = labels;
    //                         this.localLineChartData = allData;
    //                       }
    //                     }
    //                   });
    //               }
    //             );
    //           }
    //         );
    //       }
    //     );
    //   }
    // );


    // this.forecastService.getTimeEntries('?' + params).subscribe(
    //   timeEntries => {
    //     console.log(timeEntries);
    //
    //     console.log('a');
    //
    //
    //     // !!! this loops needs to be optimized !!!
    //     const totalCapacities = [];
    //     const test = [];
    //     const fcTotalCapacities = [];
    //     for (let i = 0; i < timeEntries.result.length; i++) {
    //       const date = this.datePipe.transform(timeEntries.result[i].spent_at, 'MM-dd-yyyy');
    //       const monday = this.datePipe.transform(this.forecastService.getMonday(date), 'MM-dd-yyyy');
    //       if (totalCapacities[monday] == null) {
    //         totalCapacities[monday] = 0;
    //       }
    //       // if (test[monday + '//' + timeEntries.result[i].user_id] == null) {
    //       //   test[monday + '//' + timeEntries.result[i].user_id] = 0;
    //       // }
    //       totalCapacities[monday] += timeEntries.result[i].hours * timeEntries.result[i].cost;
    //       // test[monday + '//' + timeEntries.result[i].user_id] += timeEntries.result[i].hours;
    //     }
    //
    //
    //     console.log('b');
    //
    //     let actualCap = 0;
    //     let forecastCap = 0;
    //     const index = params.indexOf('project');
    //     this.forecastService.getProjects('/' + params.substring(index + 10)).subscribe(
    //       project => {
    //         const budgetData = this.parse(project.result[0].notes);
    //         // this.budget = project.result[0].cost_budget;
    //         // REMOVE THIS!!
    //         // this.budget = 3800;
    //         console.log('?' + params);
    //         this.forecastService.getResources('?' + params).subscribe(
    //           dataTC => {
    //             for (const week in totalCapacities) {
    //               labels.push(week);
    //             }
    //
    //             console.log('c');
    //
    //             // Combines all the actual dates with the forecasted dates
    //             for (let i = 0; i < this.weeks.length; i++) {
    //               const week = this.datePipe.transform(this.weeks[i], 'MM-dd-yyyy');
    //               if (labels.indexOf(week) === -1) {
    //                 labels.push(week);
    //               }
    //             }
    //
    //             console.log('d');
    //
    //             // Cycles through the dates and checks for missing Mondays and adds them if found
    //             for (let i = 0; new Date(labels[i]).getTime() < new Date(this.datePipe.transform(this.weeks[0], 'MM-dd-yyyy')).getTime(); i++) {
    //               const firstDate = new Date(labels[i]);
    //               firstDate.setDate(firstDate.getDate() + 7);
    //               const secondDate = new Date(labels[i + 1]);
    //
    //               if (firstDate.toDateString() !== secondDate.toDateString()) {
    //                 labels.splice(i + 1, 0, this.datePipe.transform(firstDate, 'MM-dd-yyyy'));
    //               }
    //             }
    //
    //             console.log('e');
    //
    //             for (let i = 0; i < dataTC.totalCapacities.length; i++) {
    //               fcTotalCapacities[this.datePipe.transform(dataTC.totalCapacities[i].week, 'MM-dd-yyyy')] = dataTC.totalCapacities[i].capacity;
    //             }
    //
    //             console.log('f');
    //
    //             // Adds forecasted data to graph arrays
    //             this.forecastService.getResources('?' + params + '&active=1&cost=1').subscribe(
    //               resources => {
    //
    //                 breakPointData.push([]);
    //                 let budgetIndex = 0;
    //                 for (let i = 0; new Date(labels[i]).getTime() < new Date(this.datePipe.transform(this.weeks[0], 'MM-dd-yyyy')).getTime(); i++) {
    //                   actualCap += (!isNullOrUndefined(totalCapacities[labels[i]]) ? totalCapacities[labels[i]] : 0);
    //                   forecastCap += (!isNullOrUndefined(totalCapacities[labels[i]]) ? totalCapacities[labels[i]] : 0);
    //                   // forecastCap = (!isNullOrUndefined(fcTotalCapacities[labels[i]]) ? fcTotalCapacities[labels[i]] + forecastCap : forecastCap);
    //                   actualData.push(actualCap);
    //                   forecastData.push(forecastCap);
    //                   const endWeek = (!isNullOrUndefined(budgetData[budgetIndex]) ? new Date(budgetData[budgetIndex].endWeek) : null);
    //                   if (!isNullOrUndefined(endWeek) && endWeek.getTime() >= new Date(labels[i]).getTime()) {
    //                     breakPointData[budgetIndex].push(Number(budgetData[budgetIndex].budget));
    //                   }
    //
    //                   if (!isNullOrUndefined(endWeek) && endWeek.getTime() === new Date(labels[i]).getTime()) {
    //                     budgetIndex++;
    //                     breakPointData.push([]);
    //                     for (let j = 0; j < breakPointData[budgetIndex - 1].length; j++) {
    //                       breakPointData[budgetIndex].push(null);
    //                     }
    //                     if (!isNullOrUndefined(budgetData[budgetIndex])) {
    //                       breakPointData[budgetIndex - 1].push(Number(budgetData[budgetIndex].budget));
    //                     }
    //
    //                   }
    //                 }
    //
    //                 console.log('g');
    //
    //                 let index = 0;
    //                 for (let i = 0; i < this.weeks.length; i++) {
    //                   const capacity = resources.totalCapacities[index];
    //                   if (!isNullOrUndefined(capacity) && capacity.week === this.weeks[i]) {
    //                     forecastCap += capacity.cost;
    //                     forecastData.push(forecastCap);
    //                     index++;
    //                   } else {
    //                     forecastData.push(forecastCap);
    //                   }
    //                   const endWeek = (!isNullOrUndefined(budgetData[budgetIndex]) ? new Date(budgetData[budgetIndex].endWeek) : null);
    //                   if (!isNullOrUndefined(endWeek) && endWeek.getTime() >= new Date(labels[i]).getTime()) {
    //                     breakPointData[budgetIndex].push(Number(budgetData[budgetIndex].budget));
    //                   }
    //                   if (!isNullOrUndefined(endWeek) && endWeek.getTime() === new Date(this.weeks[i]).getTime()) {
    //                     budgetIndex++;
    //                     breakPointData.push([]);
    //                     for (let j = 0; j < breakPointData[budgetIndex - 1].length; j++) {
    //                       breakPointData[budgetIndex].push(null);
    //                     }
    //                     if (!isNullOrUndefined(budgetData[budgetIndex])) {
    //                       breakPointData[budgetIndex - 1].push(Number(budgetData[budgetIndex].budget));
    //                     }
    //                   }
    //                 }
    //
    //                 console.log('h');
    //
    //                 this.lineChartLabels.next(labels);
    //                 allData[0].data = actualData;
    //                 allData[1].data = forecastData;
    //                 for (let i = breakPointData.length - 1; i >= 0; i--) {
    //                   if (breakPointData[i].length > 0) {
    //                     allData.push({data: breakPointData[i], label: budgetData[i].notes});
    //                   }
    //                 }
    //                 // allData[2].data = breakPointData;
    //                 this.lineChartData.next(allData);
    //
    //                 this.localLineChartLabels = labels;
    //                 this.localLineChartData = allData;
    //               }
    //             );
    //
    //           }
    //         );
    //       }
    //     );
    //   }
    // );
  }
}
