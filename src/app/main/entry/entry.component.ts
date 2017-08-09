/**
 * Created by Rami Khadder on 8/7/2017.
 */
import {Component, Input, OnInit} from '@angular/core';
import {Entry} from './entry.model';
import {isNullOrUndefined} from "util";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss']
})
export class EntryComponent implements OnInit {

  static monday: Date;
  static weeks = [];
  static updates = [];
  enabled: boolean;
  id: number;
  @Input()employeeName: string;
  @Input()clientName: string;
  @Input()projectName: string;
  @Input()entry: Entry;
  timerSubscription;


  test(week) {
    this.enabled = false;
    console.log('id: ' + this.id);
    console.log('week: ' + week);
    if (this.id - 1 === week) {
      this.id = week;
    } else {
      this.id = week + 1;
    }
    this.enabled = true;
  }

  constructor() { }

  ngOnInit() {

    if (isNullOrUndefined(EntryComponent.monday)) {
      EntryComponent.monday = this.getMonday();
    }

    if (EntryComponent.weeks.length !== 20) {
      const monday = EntryComponent.monday;
      for (let i = 0; i < 20; i++) {
        const date = new Date(monday.toDateString());
        EntryComponent.weeks.push(date);
        monday.setDate(monday.getDate() + 7);
      }
    }
  }

  getMonday(): Date {
    const date = new Date();
    while (date.getDay() !== 1) {
      date.setDate(date.getDate() - 1);
    }
    return date;
  }

  get staticWeeks() {
    return EntryComponent.weeks;
  }

  yo(ay: string) {
    if (!isNullOrUndefined(this.timerSubscription)) {
      this.timerSubscription.unsubscribe();
    }
    const timer = Observable.timer(10000);
    this.timerSubscription = timer.subscribe(t => {
      console.log(ay);
    });
  }

}
