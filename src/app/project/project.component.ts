import {
  AfterContentInit, AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Output,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ProjectService} from './project.service';
import {ForecastService} from '../forecast/forecast.service';
import {isNullOrUndefined, isUndefined} from 'util';
import {GraphService} from './graph/graph.service';
import {MilestonePromptComponent} from './milestone-prompt/milestone-prompt.component';
import {MdDialog, MdIconRegistry, MdMenu, MdMenuTrigger} from '@angular/material';
import {DomSanitizer} from "@angular/platform-browser";
import {Location} from '@angular/common';


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
  private lastParams = {
    id: '',
    path: ''
  };
  public params: any;
  public budget;
  public internalCost;
  public budgetSpent;
  public projectedProfit;
  public projectedProfitMargin;
  public remaining;
  private subscriptions = [];
  public filterList = [];
  public filterName = 'All Projects';

  public projects;
  public clients;

  public isGraphShowing = false;

  public height = '76.5vh';
  public forecastHeight = '91.3vh';

  constructor(private route: ActivatedRoute,
              private forecastService: ForecastService,
              public graphService: GraphService,
              private dialog: MdDialog,
              private router: Router,
              private iconRegistry: MdIconRegistry,
              private sanitizer: DomSanitizer,
              private location: Location) {
    iconRegistry.addSvgIcon(
      'drop-down',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_arrow_drop_down_white_48px.svg'));
  }

  filter(id, name) {
    if (id !== this.params.id) {
      this.filterName = name;
      let path = '';
      if (id !== '') {
        this.isGraphShowing = name.indexOf('All Projects') === -1;
        path = (name.indexOf('All Projects') === -1 ? 'project' : 'client');
        // type = (name.indexOf('All Projects') === -1 ? 'projectId=' : 'clientId=') + id;
        this.router.navigate(['/' + path + '/' + id]);
      } else {
        this.isGraphShowing = false;
        this.router.navigate(['all']);
      }
      // this.forecastService.params.next(type);
    }
    this.parentMenu.closeMenu();
  }

  checkForChildren(amountOfChildren) {
    return amountOfChildren > 1;
  }

  ngOnInit() {

    console.log('ngOnInit - project.components.ts');

    // moved to URL subscription!!!!!!!!
    // if (isNullOrUndefined(this.forecastService.allEmployees.getValue())) {
    //   this.forecastService.updateAllEmployees();
    // }
    //
    // if (isNullOrUndefined(this.forecastService.allActiveProjects.getValue())) {
    //   this.forecastService.updateAllActiveProjects();
    // }
    //
    // /*
    // this.forecastService.getProjects('?active=1').subscribe(
    //   data => {
    //     data.result.splice(0, 0, {id: '', name: 'All'});
    //     this.forecastService.projects.next(data.result);
    //     this.projects = data.result;
    //   }
    // );
    // */
    //
    // this.forecastService.getClientsAndProjects().subscribe(
    //   data => {
    //     this.filterList = data.result;
    //   }
    // );

    this.subscriptions.push(this.forecastService.params$.subscribe(
      params => {
        console.log('params!!!!!!!!!!! ' + JSON.stringify(params));
        this.params = params;
        if (this.params.id !== this.lastParams.id) {
          if (this.params.id !== '') {
            this.forecastService.getClients('/' + this.params.id).subscribe(
              client => {
                if (client.result.length <= 0) {
                  console.log('OH');
                  this.forecastService.getProjectAndClient(this.params.id).subscribe(
                    project => {
                      this.forecastService.current.next(project.result[0]);
                      const projectName = project.result[0].name;
                      const clientName = project.result[0].client_name;
                      this.filterName = clientName + ' - ' + projectName;
                      // this.location.replaceState('/project/' + this.params.id + '/' +
                      //   clientName.toLowerCase().replace(/ /g, '_') + '/' +
                      //   projectName.toLowerCase().replace(/ /g, '_'));
                    }
                  );
                } else {
                  console.log('AH');
                  this.forecastService.current.next(client.result[0]);
                  const clientName = client.result[0].name;
                  this.filterName = clientName;
                  // this.location.replaceState('/client/' + this.params.id + '/' +
                  //   clientName.toLowerCase().replace(/ /g, '_'));
                }
              }
            );
          }

          console.log('DONE WITH PARAMS!');

          this.lastParams = this.params;

        }
      }
    ));


    this.subscriptions.push(this.route.url.subscribe(
      urlSegments => {
        console.log('url!!!!');

        if (isNullOrUndefined(this.forecastService.allEmployees.getValue())) {
          this.forecastService.updateAllEmployees();
        }

        if (isNullOrUndefined(this.forecastService.allActiveProjects.getValue())) {
          this.forecastService.updateAllActiveProjects();
        }

        this.forecastService.getClientsAndProjects().subscribe(
          data => {
            this.filterList = data.result;
          }
        );

        if (urlSegments.length > 1) {

          console.log('PROJECT VIEW!!!!');
          const path = urlSegments[0].path;
          const id = urlSegments[1].path;
          this.isGraphShowing = (path === 'project');
          this.forecastService.params.next({
            id: id,
            path: path,
            openEmployees: []
          });

        } else if (urlSegments.length === 1 && urlSegments[0].path === 'all') {
          console.log('ALL VIEW!!!!');
          const path = '';
          const id = '';
          this.isGraphShowing = false;
          this.forecastService.params.next({
            id: id,
            path: path,
            openEmployees: []
          });
        }

        /*
        // moved initializeGraph to the forecast component to prevent another getEmployee call.
        if (this.isGraphShowing) {
          this.graphService.initializeGraph(this.params, true);
        }
        */
        this.forecastService.updateRollUps(this.params);
      }
    ));


    this.subscriptions.push(this.graphService.lineChartData$.subscribe(
      lineChartData => {
        this.budget = lineChartData[lineChartData.length - 1].data[lineChartData[lineChartData.length - 1].data.length - 1];
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

  subscribeToParams() {

  }

  ngOnDestroy() {
    console.log('DESTROY PROJECT COMPONENT!')
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
