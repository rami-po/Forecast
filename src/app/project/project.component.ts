import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
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
  private lastParams = '';
  public params = '';
  public budget;
  public internalCost;
  public budgetSpent;
  public projectedProfit;
  public projectedProfitMargin;
  public remaining;
  private subscriptions = [];

  public projects;
  public clients;

  public isDisabled = true;
  public isGraphShowing = false;
  public graphButton = 'Show Graph';
  public filterName = '';

  public height = '71.7vh';
  public forecastHeight = '90.3vh';

  constructor(private route: ActivatedRoute,
              private forecastService: ForecastService,
              public graphService: GraphService,
              private dialog: MdDialog) {
  }

  ngOnInit() {

    this.forecastService.getProjects('?active=1').subscribe(
      data => {
        data.result.splice(0, 0, {id: '', name: 'All'});
        this.forecastService.projects.next(data.result);
        this.projects = data.result;
      }
    );

    this.forecastService.getClients('?active=1').subscribe(
      data => {
        data.result.splice(0, 0, {id: '', name: 'All'});
        this.forecastService.clients.next(data.result);
        this.clients = data.result;
      }
    );

    this.forecastService.params$.subscribe(
      params => {
        this.params = params;
        if (this.params !== this.lastParams) {
          this.lastParams = this.params;
          if (this.isGraphShowing) {
            this.graphService.initializeGraph(this.params);
          }
        }
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


    // this.route.queryParams.subscribe(
    //   params => {
    //
    //     if (!isUndefined(params.id)) {
    //       this.projectId = params.id;
    //       this.params = '?projectId=' + params.id;
    //     } else {
    //       this.params = '?projectId=' + this.projectId;
    //     }
    //
    //     this.forecastService.getProjects('/' + this.projectId).subscribe(
    //       data => {
    //         this.budget = data.result[0].budget;
    //         this.projectName = data.result[0].name;
    //         console.log(data.result);
    //       }
    //     );
    //
    //     this.forecastService.getEntries('?projectId=' + this.projectId).subscribe(
    //       data => {
    //         this.clientName = data.result[0].client_name;
    //       }
    //     );
    //
    //     this.subscriptions.push(this.graphService.lineChartData$.subscribe(
    //       lineChartData => {
    //         this.budget = lineChartData[2].data[lineChartData[2].data.length - 1];
    //         this.internalCost = lineChartData[0].data[lineChartData[0].data.length - 1];
    //         this.budgetSpent = Number(this.budget) - Number(this.internalCost);
    //         this.remaining = this.budget - this.budgetSpent;
    //         const projectedInternalCost = Number(lineChartData[1].data[lineChartData[1].data.length - 1]);
    //         this.projectedProfit = Number(this.budget) - projectedInternalCost;
    //         this.projectedProfitMargin = 100 - ((projectedInternalCost / Number(this.budget)) * 100);
    //       }
    //     ));
    //
    //   }
    // );
  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  updateEntries(entry, id, name) {
    let params = '';
    if (id !== '') {
      if (entry === 'project') {
        params = '&projectId=' + id;
        this.isDisabled = false;
      } else {
        params = '&clientId=' + id;
        this.graphButton = 'Show Graph';
        this.isGraphShowing = false;
        this.isDisabled = true;
      }
      this.filterName = '- ' + name;
    } else {
      this.graphButton = 'Show Graph';
      this.isGraphShowing = false;
      this.isDisabled = true;
      this.filterName = '';
    }

    this.forecastService.params.next(params);

  }

  updateGraphView() {
    this.isGraphShowing = !this.isGraphShowing;
    switch (this.isGraphShowing) {
      case true:
        this.graphService.initializeGraph(this.params);
        this.graphButton = 'Hide Graph';
        break;
      case false:
        this.graphButton = 'Show Graph';
        break;
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
