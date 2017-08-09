import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.scss']
})
export class GridViewComponent implements OnInit {
  @Input()employeeName: string;
  @Input()clientName: string;
  @Input()projectName: string;

  weeks = [];

  constructor() { }

  ngOnInit() {
    const today = new Date();
    for (let i = 0; i < 20; i++) {
      const date = new Date(today.toDateString());
      this.weeks.push(date);
      today.setDate(today.getDate() + 7);
    }
  }

}
