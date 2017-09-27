import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ForecastService} from '../../forecast/forecast.service';
import {ActivatedRoute} from '@angular/router';
import {GraphService} from './graph.service';
// import 'chartjs-plugin-zoom';
import 'chartjs-plugin-annotation';
import {ChartComponent} from 'angular2-chartjs';
import {MdDialog} from '@angular/material';
import {MilestonePromptComponent} from '../milestone-prompt/milestone-prompt.component';
import {ProjectService} from '../project.service';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  providers: [MilestonePromptComponent, ProjectService]
})
export class GraphComponent implements OnInit, OnDestroy {

  @Input() public projectId;
  @Input() public tableEnabled = true;
  @Input() public params;
  @ViewChild(ChartComponent) chart: ChartComponent;

  private subscriptions = [];

  generateDeadLine = (event, array) => {
    if (array.length > 0) {
      this.dialog.open(MilestonePromptComponent);
      this.options.annotation.annotations[0].value = this.data.labels[array[0]._index];
      this.chart.chart.update();
    }
  }

  type = 'line';
  data = {
    labels: [],
    datasets: [
      {
        label: 'Cost (Forecast)',
        data: [],
        backgroundColor: 'rgba(255, 180, 66, .2)',
        borderColor: 'rgba(255, 180, 66, 1)',
        pointBackgroundColor: 'rgba(255, 180, 66, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 180, 66, .8)',
        lineTension: null,
        hidden: false
      },
      {
        label: 'Cost (Actual)',
        data: [],
        backgroundColor: 'rgba(255, 152, 0, .2)',
        borderColor: 'rgba(255, 152, 0, 1)',
        pointBackgroundColor: 'rgba(255, 152, 0, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 152, 0, .8)',
        lineTension: null,
        hidden: false
      },
      {
        label: 'Revenue (Forecast)',
        data: [],
        backgroundColor: 'rgba(90, 176, 246, .2)',
        borderColor: 'rgba(90, 176, 246, 1)',
        pointBackgroundColor: 'rgba(90, 176, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(90, 176, 246, .8)',
        lineTension: null,
        hidden: false
      },
      {
        label: 'Revenue (Actual)',
        data: [],
        backgroundColor: 'rgba(33, 150, 243, .2)',
        borderColor: 'rgba(33, 150, 243, 1)',
        pointBackgroundColor: 'rgba(33, 150, 243, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(33, 150, 243, .8)',
        lineTension: null,
        hidden: false
      },
      {
        label: 'Cost (Trend)',
        data: [],
        backgroundColor: 'rgba(255, 152, 0, .2)',
        borderColor: 'rgba(255, 152, 0, 1)',
        pointBackgroundColor: 'rgba(255, 152, 0, 0)',
        pointBorderColor: 'rgba(0, 0, 0, 0)',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 152, 0, .8)',
        lineTension: null,
        hidden: false,
        spanGaps: true,
        borderDash: [5, 5]
      },
      {
        label: 'Revenue (Trend)',
        data: [],
        backgroundColor: 'rgba(33, 150, 243, .2)',
        borderColor: 'rgba(33, 150, 243, 1)',
        pointBackgroundColor: 'rgba(33, 150, 243, 0)',
        pointBorderColor: 'rgba(0, 0, 0, 0)',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(33, 150, 243, .8)',
        lineTension: null,
        hidden: false,
        spanGaps: true,
        borderDash: [5, 5]
      },
      {
        label: 'Cost',
        data: [],
        backgroundColor: 'rgba(255, 152, 0, .2)',
        borderColor: 'rgba(255, 152, 0, 1)',
        pointBackgroundColor: 'rgba(255, 152, 0, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 152, 0, .8)',
        lineTension: null,
        hidden: false
      },
      {
        label: 'Revenue',
        data: [],
        backgroundColor: 'rgba(33, 150, 243, .2)',
        borderColor: 'rgba(33, 150, 243, 1)',
        pointBackgroundColor: 'rgba(33, 150, 243, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(33, 150, 243, .8)',
        lineTension: null,
        hidden: false
      },
      {
        label: 'Budget',
        data: [],
        backgroundColor: 'rgba(244, 67, 54, .2)',
        borderColor: 'rgba(244, 67, 54, 1)',
        pointBackgroundColor: 'rgba(244, 67, 54, 0)',
        pointBorderColor: 'rgba(0, 0, 0, 0)',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(244, 67, 54, .8)',
        lineTension: 0,
        hidden: false
      }
    ]
  };
  options = {
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
    legend: {
      position: 'right',
      reverse: true,
      onClick: ($event, legendItem) => {
        switch (legendItem.datasetIndex) {
          case 6:
            this.data.datasets[0].hidden = !this.data.datasets[0].hidden;
            this.data.datasets[1].hidden = !this.data.datasets[1].hidden;
            this.data.datasets[6].hidden = !this.data.datasets[6].hidden;
            this.chart.chart.update();
            break;
          case 7:
            this.data.datasets[2].hidden = !this.data.datasets[2].hidden;
            this.data.datasets[3].hidden = !this.data.datasets[3].hidden;
            this.data.datasets[7].hidden = !this.data.datasets[7].hidden;
            this.chart.chart.update();
            break;
          case 8:
            for (let i = 8; i < this.data.datasets.length; i++) {
              this.data.datasets[i].hidden = !this.data.datasets[i].hidden;
            }
            this.chart.chart.update();
            break;
          default:
            this.data.datasets[legendItem.datasetIndex].hidden = !this.data.datasets[legendItem.datasetIndex].hidden;
            this.chart.chart.update();
            break;
        }
      },
      labels: {
        filter: (legendItem, chartData) => {
          switch (legendItem.datasetIndex) {
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
              return true;
            default:
              return false;
          }
          // return true or false based on legendItem's datasetIndex (legendItem.datasetIndex)
        }
      },
    },
    zoom: {
      enabled: false,
      drag: false,
      mode: 'x'
    },
    pan: {
      enabled: false,
      mode: 'x'
    },
    annotation: {
      drawTime: 'afterDatasetsDraw',
      events: ['mouseover', 'mouseleave'],
      annotations: [{
        drawTime: 'afterDraw',
        type: 'line',
        mode: 'vertical',
        scaleID: 'closeParentMenu-axis-0',
        value: '',
        borderColor: 'red',
        borderWidth: 2,
        label: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          fontFamily: 'sans-serif',
          fontSize: 12,
          fontStyle: 'bold',
          fontColor: '#fff',
          xPadding: 6,
          yPadding: 6,
          cornerRadius: 6,
          position: 'center',
          xAdjust: 0,
          yAdjust: 0,
          enabled: false,
          content: 'Test label'
        },
        onMouseover: event => {
          (this.options.annotation.annotations[0]).label.enabled = true;
          this.chart.chart.update();
        },
        onMouseleave: event => {
          (this.options.annotation.annotations[0]).label.enabled = false;
          this.chart.chart.update();
        }

      }]
    },
    onClick: this.generateDeadLine
  };

  constructor(private route: ActivatedRoute,
              public graphService: GraphService,
              private projectService: ProjectService,
              private forecastService: ForecastService,
              private dialog: MdDialog) {
  }

  ngOnInit() {
    const monday = this.forecastService.getMonday(new Date());
    this.graphService.weeks = this.forecastService.getWeeks(monday);
    console.log(this.graphService.weeks);
    this.graphService.params = this.params;

    // this.graphService.initializeGraph(this.params);

    this.subscriptions.push(this.graphService.lineChartData$.subscribe(
      data => {
        const dataSets = 9;
        const shift = dataSets - 6;

        for (let i = dataSets; i <= this.data.datasets.length; i++) {
          this.data.datasets.splice(dataSets, 1); // clears budget since there are a different amount per project
        }
        this.data.datasets[0].data = data[0].data;
        this.data.datasets[1].data = data[1].data;
        this.data.datasets[2].data = data[2].data;
        this.data.datasets[3].data = data[3].data;
        this.data.datasets[4].data = data[4].data;
        this.data.datasets[5].data = data[5].data;
        for (let i = dataSets; i < data.length + shift; i++) {
          this.data.datasets[i] = {
            label: data[i - shift].label,
            data: data[i - shift].data,
            backgroundColor: 'rgba(0, 0, 0, 0)',
            borderColor: 'rgba(244, 67, 54, 1)',
            pointBackgroundColor: 'rgba(244, 67, 54, 0)',
            pointBorderColor: 'rgba(0, 0, 0, 0)',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(244, 67, 54, .8)',
            lineTension: 0,
            hidden: false
          };
        }

        this.chart.chart.update();
      }
    ));

    this.subscriptions.push(this.graphService.lineChartLabels$.subscribe(
      data => {
        this.data.labels = data;
      }
    ));

  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }


}
