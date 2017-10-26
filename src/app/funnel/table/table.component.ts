import {Component, Input, OnInit} from '@angular/core';
import {isNullOrUndefined} from "util";
import {Observable} from "rxjs/Observable";
import {FunnelService} from "../funnel.service";

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: [FunnelService]
})
export class TableComponent implements OnInit {

  @Input() funnelItems: any;
  @Input() projects: any;
  private timerSubscription: any;

  public ynOptions = [
    {name: 'Yes', value: 1},
    {name: 'No', value: 0}
  ];

  public statusOptions = [
    {name: 'Pitched', value: 'Pitched'},
    {name: 'Scoped', value: 'Scoped'},
    {name: 'SOW Drafted', value: 'SOW Drafted'},
    {name: 'SOW Presented', value: 'SOW Presented'},
    {name: 'SOW Negotiation', value: 'SOW Negotiation'},
    {name: 'SOW Signed', value: 'SOW Signed'}
  ];

  constructor(private funnelService: FunnelService) {
  }

  ngOnInit() {
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

  updateOnSelect() {

  }

  clicked(item) {
    console.log(item);
    console.log('clicked');
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
      console.log('event: ' + $event);
      console.log('event: ' + $event.toString());
      console.log('hm');
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

  getMonthlyRevenue(revenue, weeks) {
    return revenue / (weeks / 4.34);
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

}
