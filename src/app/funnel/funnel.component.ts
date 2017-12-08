import {Component, OnDestroy, OnInit} from '@angular/core';
import {FunnelService} from "./funnel.service";
import {DomSanitizer} from "@angular/platform-browser";
import {MatDialog, MatIconRegistry} from "@angular/material";
import {AddFunnelItemComponent} from "./add-funnel-item/add-funnel-item.component";
import {ForecastService} from "../forecast/forecast.service";

@Component({
  selector: 'app-funnel',
  templateUrl: './funnel.component.html',
  styleUrls: ['./funnel.component.scss'],
  providers: [FunnelService],
  entryComponents: [AddFunnelItemComponent]
})
export class FunnelComponent implements OnInit, OnDestroy {

  private subscriptions = [];
  public funnelItems;
  public defaultFunnelItems;
  public projects;
  public keyedProjects = [];
  public isDataReady = false;

  constructor(private funnelService: FunnelService,
              private forecastService: ForecastService,
              private iconRegistry: MatIconRegistry,
              private sanitizer: DomSanitizer,
              private dialog: MatDialog) {
    iconRegistry.addSvgIcon(
      'add',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_add_white_48px.svg'));
  }

  ngOnInit() {
    this.subscriptions.push(this.funnelService.funnelItems$.subscribe(
      data => {
        console.log('FUNNEL ITEMS!!!');
        console.log(data);
        this.funnelItems = data;
        this.defaultFunnelItems = JSON.parse(JSON.stringify(data));
      }
    ));

    this.funnelService.updateFunnelItems();

    this.subscriptions.push(this.forecastService.getProjects('?active=1').subscribe(
      data => {
        this.projects = data.result;
        // this.projects.unshift({name: 'No Scala Project', id: -1});
        for (const project of this.projects) {
          this.keyedProjects[project.name] = project.id;
        }
        console.log(this.projects);
        this.isDataReady = true;
      }
    ));

  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  addFunnelItem() {
    const dialog = this.dialog.open(AddFunnelItemComponent);
    dialog.componentInstance.custom = true;
    dialog.componentInstance.dismissible = true;
    dialog.componentInstance.projects = JSON.parse(JSON.stringify(this.projects));
    dialog.componentInstance.keyedProjects = this.keyedProjects;
    dialog.componentInstance.title = 'Funnel Item';
    dialog.afterClosed().subscribe(
      confirmed => {
        if (confirmed) {
          this.funnelService.updateFunnelItems();
        }
        console.log(confirmed);
      }
    );
  }

}
