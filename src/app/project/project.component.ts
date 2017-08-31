import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ProjectService} from './project.service';
import {ForecastService} from '../forecast/forecast.service';
import {isUndefined} from 'util';
import {GraphService} from './graph/graph.service';
import {MilestonePromptComponent} from './milestone-prompt/milestone-prompt.component';
import {MdDialog} from '@angular/material';


@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  providers: [MilestonePromptComponent]
})
export class ProjectComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() public projectId;
  @Input() public tableEnabled = true;
  public params;
  public projectName;
  public clientName;
  public budget;
  public internalCost;
  public budgetSpent;
  public projectedProfit;
  public projectedProfitMargin;
  public remaining;
  private subscriptions = [];

  constructor(private route: ActivatedRoute,
              private mainService: ForecastService,
              public graphService: GraphService,
              private dialog: MdDialog) {
  }

  b() {
    this.dialog.open(MilestonePromptComponent);
  }

  ngOnInit() {

    // this.dialog.open(MilestonePromptComponent);

    this.route.queryParams.subscribe(
      params => {

        if (!isUndefined(params.id)) {
          this.projectId = params.id;
          this.params = '?projectId=' + params.id;
        } else {
          this.params = '?projectId=' + this.projectId;
        }

        this.mainService.getProjects('/' + this.projectId).subscribe(
          data => {
            this.budget = data.result[0].budget;
            this.projectName = data.result[0].name;
            console.log(data.result);
          }
        );

        this.mainService.getEntries('?projectId=' + this.projectId).subscribe(
          data => {
            this.clientName = data.result[0].client_name;
          }
        );

        this.subscriptions.push(this.graphService.lineChartData$.subscribe(
          lineChartData => {
            this.budget = lineChartData[2].data[lineChartData[2].data.length - 1];
            this.internalCost = lineChartData[0].data[lineChartData[0].data.length - 1];
            this.budgetSpent = Number(this.budget) - Number(this.internalCost);
            this.remaining = this.budget - this.budgetSpent;
            const projectedInternalCost = Number(lineChartData[1].data[lineChartData[1].data.length - 1]);
            this.projectedProfit = Number(this.budget) - projectedInternalCost;
            this.projectedProfitMargin = 100 - ((projectedInternalCost / Number(this.budget)) * 100);
          }
        ));

      }
    );
  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    if (this.tableEnabled) {
      const graph = document.getElementById('graph');
      // graph.style.width = '1000px';
      // const marginTop = '600px';
      // const title = document.getElementById('title');
      // const side = document.getElementById('side');
      // const table = document.getElementById('table');
      // const header = document.getElementById('header');
      // header.style.marginTop = marginTop;
      // title.style.marginTop = marginTop;
      // side.style.marginTop = marginTop;
      // table.style.marginTop = '187px';
    }
  }
}
