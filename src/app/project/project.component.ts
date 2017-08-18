import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ProjectService} from './project.service';
import {MainService} from '../main/main.service';
import {isNullOrUndefined} from "util";
import {DatePipe} from '@angular/common';
import {BaseChartDirective} from "ng2-charts";


@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  providers: [MainService]
})
export class ProjectComponent implements OnInit {

  public members = [];
  public params;

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
    public projectService: ProjectService,
    private mainService: MainService
  ) { }

  ngOnInit() {

    const marginTop = '600px';
    const title = document.getElementById('title');
    const side = document.getElementById('side');
    const table = document.getElementById('table');
    const header = document.getElementById('header');
    header.style.marginTop = marginTop;
    title.style.marginTop = marginTop;
    side.style.marginTop = marginTop;
    table.style.marginTop = '237px';

    this.route.queryParams.subscribe(
      params => {

        this.params = '?projectId=' + params.id;

        const monday = this.mainService.getMonday(new Date());
        this.projectService.weeks = this.mainService.getWeeks(monday);
        this.projectService.params = this.params;

        this.projectService.initializeGraph();

        this.projectService.getMembers('/' + params.id).subscribe(
          data => {
            this.members = data.result;
          }
        );
      }
    );
  }
}
