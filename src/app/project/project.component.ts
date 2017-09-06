import {
  AfterContentInit, AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Output,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ProjectService} from './project.service';
import {ForecastService} from '../forecast/forecast.service';
import {isUndefined} from 'util';
import {GraphService} from './graph/graph.service';
import {MilestonePromptComponent} from './milestone-prompt/milestone-prompt.component';
import {MdDialog, MdIconRegistry, MdMenu, MdMenuTrigger} from '@angular/material';
import {DomSanitizer} from "@angular/platform-browser";


@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  providers: [MilestonePromptComponent]
})
export class ProjectComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('parentMenu') parentMenu: MdMenuTrigger;
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
  public filterList = [];
  public filterName = 'All Clients and Projects';

  public projects;
  public clients;

  public isGraphShowing = false;

  public height = '76.5vh';
  public forecastHeight = '90.3vh';

  constructor(private route: ActivatedRoute,
              private forecastService: ForecastService,
              public graphService: GraphService,
              private dialog: MdDialog,
              private iconRegistry: MdIconRegistry,
              private sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'drop-down',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_arrow_drop_down_white_48px.svg'));
  }

  filter(id, name) {
    this.filterName = name;
    let params = '';
    if (id !== '') {
      if (name.indexOf('All Projects') === -1) {
        this.isGraphShowing = true;
        this.graphService.initializeGraph(this.params);
      } else {
        this.isGraphShowing = false;
      }
      params = (name.indexOf('All Projects') === -1 ? '&projectId=' : '&clientId=') + id;
    } else {
      this.isGraphShowing = false;
    }
    this.forecastService.params.next(params);
    this.parentMenu.closeMenu();
  }

  checkForChildren(amountOfChildren) {
    return amountOfChildren > 1;
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
        // data.result.splice(0, 0, {id: '', name: 'All'});
        this.forecastService.clients.next(data.result);
        this.clients = data.result;
        for (let i = 0; i < this.clients.length; i++) {
          this.forecastService.getProjects('?clientId=' + this.clients[i].id + '&active=1').subscribe(
            projects => {
              if (projects.result.length > 1) {
                projects.result.splice(0, 0, {id: this.clients[i].id, name: 'All Projects'});
              }
              if (projects.result.length > 0) {
                this.filterList.push({name: this.clients[i].name, id: this.clients[i].id, projects: projects.result});
              }
            }
          );
        }
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
