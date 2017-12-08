import {Component, Input, OnInit} from '@angular/core';
import {isNullOrUndefined} from "util";
import {Observable} from "rxjs/Observable";
import {FunnelService} from "../funnel.service";
import {MatDialog, MatIconRegistry} from "@angular/material";
import {DomSanitizer} from "@angular/platform-browser";
import {AddFunnelItemComponent} from "../add-funnel-item/add-funnel-item.component";
import {StatusMessageDialogComponent} from "../../forecast/status-message/status-message.component";

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: []
})
export class TableComponent implements OnInit {

  @Input() defaultFunnelItems: any;
  @Input() funnelItems: any;
  @Input() projects: any;
  @Input() keyedProjects: any;
  private timerSubscription: any;

  public ynOptions = [
    {name: 'No', value: 0},
    {name: 'Yes', value: 1}
  ];

  public statusOptions = [
    {name: 'Lead', value: 'Lead'},
    {name: 'Initial Contact', value: 'Initial Contact'},
    {name: 'Pitched', value: 'Pitched'},
    {name: 'Scoped', value: 'Scoped'},
    {name: 'SOW Drafted', value: 'SOW Drafted'},
    {name: 'SOW Presented', value: 'SOW Presented'},
    {name: 'SOW Negotiation', value: 'SOW Negotiation'},
    {name: 'SOW Signed', value: 'SOW Signed'}
  ];

  public headers = [
    {name: 'Priority', sortValue: 1},
    {name: 'Project', sortValue: 1},
    {name: 'Client', sortValue: 1},
    // {name: 'New Client?', sortValue: 1},
    {name: 'PM', sortValue: 1},
    {name: 'Est Revenue', sortValue: 1},
    {name: 'Confidence', sortValue: 1},
    {name: 'Status', sortValue: 1},
    {name: 'Est Signing', sortValue: 1},
    // {name: 'Signing This Month?', sortValue: 1},
    {name: 'Est Start', sortValue: 1},
    // {name: 'Starting This Month?', sortValue: 1},
    // {name: 'Project End Date', sortValue: 1},
    // {name: 'Duration (weeks)', sortValue: 1},
    // {name: 'Duration (months)', sortValue: 1},
    {name: 'Est Monthly', sortValue: 1},
    // {name: 'Revenue From New Business', sortValue: 1},
    // {name: 'Total Pipeline Revenue', sortValue: 1},
    // {name: 'Completed?', sortValue: 1},
    {name: 'Notes', sortValue: 1},
  ];

  private funnelKeys = ['priority', 'project_name', 'client_name', 'project_manager', 'revenue', 'confidence', 'status', 'signing_date', 'start_date', 'monthly_revenue', 'notes'];

  constructor(private funnelService: FunnelService,
              private iconRegistry: MatIconRegistry,
              private sanitizer: DomSanitizer,
              private dialog: MatDialog) {
    iconRegistry.addSvgIcon(
      'edit', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_mode_edit.svg'))
      .addSvgIcon(
      'delete', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_delete.svg'))
      .addSvgIcon(
        'drop-down', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_arrow_drop_down_black_48px.svg'))
      .addSvgIcon(
        'drop-up', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_arrow_drop_up_black_48px.svg'))
      .addSvgIcon(
        'circle-filled', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_lens_black_48px.svg'))
      .addSvgIcon(
        'circle-empty', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_panorama_fish_eye_black_48px.svg'))
      .addSvgIcon(
        'circle-empty2', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_radio_button_unchecked_black_24px.svg'))
      .addSvgIcon(
        'square-empty', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_check_box_outline_blank_black_24px.svg'))
      .addSvgIcon(
        'drop-default', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_black_box_48px.svg'));
  }

  ngOnInit() {
  }

  edit(item) {
    console.log(item);

    const dialog = this.dialog.open(AddFunnelItemComponent);
    dialog.componentInstance.custom = true;
    dialog.componentInstance.dismissible = true;
    dialog.componentInstance.projects = JSON.parse(JSON.stringify(this.projects));
    dialog.componentInstance.keyedProjects = this.keyedProjects;
    dialog.componentInstance.title = 'Funnel Item';

    dialog.componentInstance.id = item.id;
    dialog.componentInstance.clientName = item.client_name;
    dialog.componentInstance.newClient = item.is_new_client == 1;
    dialog.componentInstance.projectName = item.project_name;
    dialog.componentInstance.projectManager = item.project_manager;
    dialog.componentInstance.estimatedRevenue = item.revenue;
    dialog.componentInstance.confidence = item.confidence;
    dialog.componentInstance.status = item.status;
    dialog.componentInstance.estimatedSigningDate = item.signing_date;
    dialog.componentInstance.projectedStartDate = item.start_date;
    dialog.componentInstance.projectDuration = item.duration_weeks;
    dialog.componentInstance.isCompleted = item.completed == 1;
    dialog.componentInstance.notes = item.notes;
    dialog.componentInstance.URL = item.URL;
    dialog.componentInstance.priority = item.priority;

    dialog.afterClosed().subscribe(
      confirmed => {
        console.log(confirmed);
        if (confirmed) {
          this.funnelService.updateFunnelItems();
        }
      }
    );
  }

  remove(item) {
    const dialog = this.dialog.open(StatusMessageDialogComponent);
    dialog.componentInstance.error = true;
    dialog.componentInstance.dismissible = true;
    dialog.componentInstance.title = 'Are you sure?';
    dialog.componentInstance.messages = ['Are you sure you want to delete ' + item.client_name + ' from the Funnel view?'];
    dialog.afterClosed().subscribe(
      confirmed => {
        if (confirmed) {
          this.funnelService.deleteFunnelItem(item).subscribe(
            () => {
              console.log('DELETED!');
              this.funnelService.updateFunnelItems();
            }
          );
        }
      }
    );

  }

  equalsThisMonth(signingDate) {
    const date = new Date(signingDate);
    const today = new Date();

    if (date.getMonth() === today.getMonth()) {
      return 'Yes';
    }
    return 'No';
  }

  getEndDate(weeks, start) {
    const date = new Date(start);
    date.setDate(date.getDate() + (weeks * 7));

    return date.toISOString();
  }

  type(item) {
    console.log('sending...');
    if (!isNullOrUndefined(this.timerSubscription)) {
      console.log('changed...');
      this.timerSubscription.unsubscribe();
    }
    const timer = Observable.timer(2000);
    this.timerSubscription = timer.subscribe(t => {
      this.send(item);
    });

  }

  send(item) {
    if (!isNullOrUndefined(this.timerSubscription)) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
      console.log(item);
      console.log(item.client_name + ' SENT!!!!!!!');
      this.update(item);

    }
  }

  update(item) {
    this.funnelService.updateFunnelItem(item).subscribe();
  }

  changeDate(item, key, $event) {
    console.log('sending...');
    if (!isNullOrUndefined(this.timerSubscription)) {
      console.log('changed...');
      this.timerSubscription.unsubscribe();
    }
    const timer = Observable.timer(2000);
    this.timerSubscription = timer.subscribe(t => {
      this.sendDate(item, key, $event);
    });
  }

  sendDate(item, key, $event) {
    if (!isNullOrUndefined(this.timerSubscription)) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
      const newDate = new Date($event);
      if (!isNaN(newDate.getTime())) { // date is valid
        console.log('DATE CHANGED TO ' + newDate.toISOString());
        item[key] = newDate.toISOString();
        this.update(item);
      }
    }
  }

  getDurationMonths(weeks) {
    // const durationMonths = weeks / 4.34;
    // return this.round(durationMonths, 2);
    return weeks / 4.34;
  }

  getMonthlyRevenue(revenue, weeks, index) {
    const monthlyRevenue = revenue / (weeks / 4.34);
    this.funnelItems[index]['monthly_revenue'] = monthlyRevenue;
    return monthlyRevenue;
  }

  round(value, precision) {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }

  getPipelineRevenue(revenue, confidence) {
    if (confidence < 70) {
      return 0;
    } else {
      return revenue * (confidence / 100);
    }
  }

  getRevenueFromNewBusiness(revenue, isNew) {
    if (isNew) {
      return revenue;
    }
    return NaN;
  }

  getProjectName(id) {
    for (const project of this.projects) {
      if (project.id == id) {
        return project.name;
      }
    }
  }

  getIcon(index) {
    switch (this.headers[index].sortValue) {
      case 1:
        return 'drop-default';
      case 2:
        return 'drop-down';
      case 3:
        return 'drop-up';
    }
  }

  changeIcon(index) {
    for (let i = 0; i < this.headers.length; i++) {
      if (i !== index) {
        this.headers[i].sortValue = 1;
      }
    }

    this.headers[index].sortValue += 1;
    if (this.headers[index].sortValue > 3) {
      this.headers[index].sortValue = 1;
    }

    this.sort(index);

  }

  sort(index) {
    switch (this.headers[index].sortValue) {
      case 1: // drop-default
        console.log('ONE!!!');
      console.log(this.defaultFunnelItems);
        this.funnelItems = JSON.parse(JSON.stringify(this.defaultFunnelItems));
        break;
      case 2: // drop-down
        this.funnelItems.sort(
          (a, b) => {
            if (a[this.funnelKeys[index]] < b[this.funnelKeys[index]]) {
              return -1;
            } else if (a[this.funnelKeys[index]] > b[this.funnelKeys[index]]) {
              return 1;
            } else {
              return 0;
            }
          });
        break;
      case 3: // drop-up
        this.funnelItems.sort(
          (a, b) => {
            if (a[this.funnelKeys[index]] > b[this.funnelKeys[index]]) {
              return -1;
            } else if (a[this.funnelKeys[index]] < b[this.funnelKeys[index]]) {
              return 1;
            } else {
              return 0;
            }
          });
        break;
    }
  }

}
