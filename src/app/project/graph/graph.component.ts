import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {MainService} from '../../main/main.service';
import {ActivatedRoute} from '@angular/router';
import {isUndefined} from 'util';
import {GraphService} from './graph.service';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {

  @Input() public projectId;
  @Input() public tableEnabled = true;
  @Input() public params;

  public lineChartOptions: any = {
    responsive: true,
    scales: {
      xAxes: [{
        display: true
      }],
      yAxes: [{
        display: true,
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
    public graphService: GraphService,
    private mainService: MainService
  ) { }

  ngOnInit() {
    const monday = this.mainService.getMonday(new Date());
    this.graphService.weeks = this.mainService.getWeeks(monday);
    this.graphService.params = this.params;

    this.graphService.initializeGraph();
  }


}
