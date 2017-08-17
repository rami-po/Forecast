import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ProjectService} from './project.service';
import {MainService} from '../main/main.service';
import {isNullOrUndefined} from "util";
import {DatePipe} from '@angular/common';


@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  providers: [ProjectService, MainService]
})
export class ProjectComponent implements OnInit {

  public members = [];
  public params;
  public dataIsReady = false;

  // lineChart
  public lineChartData: Array<any> = [
    {data: [], label: 'Actual'},
    {data: [], label: 'Forecast'},
    {data: [], label: 'Breakpoint'}
  ];
  public lineChartLabels: Array<any> = [];
  public lineChartOptions: any = {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    },
    pan: {
      enabled: true,
      mode: 'x'
    },
    zoom: {
      enabled: true,
      drag: false,
      mode: 'x'
    }
  };
  public lineChartType = 'line';
  public lineChartColors: Array<any> = [
    {
      backgroundColor: 'rgba(33, 150, 243, .4)',
      borderColor: 'rgba(33, 150, 243, 1)',
      pointBackgroundColor: 'rgba(33, 150, 243, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(33, 150, 243, .8)'
    },
    {
      backgroundColor: 'rgba(255, 152, 0, .2)',
      borderColor: 'rgba(255, 152, 0, 1)',
      pointBackgroundColor: 'rgba(255, 152, 0, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(255, 152, 0, .8)'
    },
    {
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderColor: 'rgba(244, 67, 54, 1)',
      pointBackgroundColor: 'rgba(244, 67, 54, 0)',
      pointBorderColor: 'rgba(0, 0, 0, 0)',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(244, 67, 54, .8)'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private mainService: MainService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(
      params => {

        this.params = '?projectId=' + params.id;

        const monday = this.mainService.getMonday();
        const weeks = this.mainService.getWeeks(monday);

        this.projectService.getTimeEntries(this.params).subscribe(
          data => {

            const totalCapacities = [];
            for (let i = 0; i < data.result.length; i++) {
              if (totalCapacities[data.result[i].spent_at] == null) {
                totalCapacities[data.result[i].spent_at] = 0;
              }
              totalCapacities[data.result[i].spent_at] += data.result[i].hours;
            }

            const keys = [];
            for (const key in totalCapacities) {
              keys.push(key);
            }

            const allWeeks = [];
            const date = new Date(weeks[0]);
            date.setDate(date.getDate() - 6);
            let totalCap = 0;
            for (let a = keys.length - 1; a >= 0; a--) {
              const tDate = this.datePipe.transform(date, 'yyyy-MM-dd');

              if (keys[a] < tDate) {
                allWeeks.push(tDate);
                this.lineChartData[0].data.push(totalCap);
                this.lineChartData[1].data.push(totalCap);
                this.lineChartData[2].data.push(3800);
                date.setDate(date.getDate() - 7);
                a++;
                continue;
              }

              totalCap += totalCapacities[keys[a]];
              if (keys[a] === tDate) {
                allWeeks.push(tDate);
                this.lineChartData[0].data.push(totalCap);
                this.lineChartData[1].data.push(totalCap);
                this.lineChartData[2].data.push(3800);
                date.setDate(date.getDate() - 7);
              }
            }

            allWeeks.reverse();
            for (let i = 0; i < weeks.length; i++) {
              allWeeks.push(weeks[i]);
            }

            this.lineChartLabels = allWeeks;

            this.mainService.getResources(this.params).subscribe(
              data => {
                console.log(data);
                for (let i = 0; i < weeks.length; i++) {
                  const capacity = data.totalCapacities[i];
                  if (!isNullOrUndefined(capacity) && capacity.week === weeks[i]) {
                    this.lineChartData[1].data.push(capacity.capacity + totalCap);
                    totalCap += capacity.capacity;
                  } else {
                    this.lineChartData[1].data.push(totalCap);
                  }
                  this.lineChartData[2].data.push(3800);
                }
                this.dataIsReady = true;
              }
            );

          }
        );

        this.projectService.getMembers('/' + params.id).subscribe(
          data => {
            console.log(data);
            this.members = data.result;
          }
        );
      }
    );
  }

  propsToArray<T>(obj: { [index: string]: T; } | { [index: number]: T; }) {
  return Object.keys(obj).map(prop => obj[prop]);
}

}
