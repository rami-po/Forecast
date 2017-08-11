import {Component, Input, OnInit} from '@angular/core';
import {isNullOrUndefined} from "util";
import {EntryComponent} from "../main/entry/entry.component";

@Component({
  selector: 'app-header-row',
  templateUrl: './header-row.component.html',
  styleUrls: ['./header-row.component.scss']
})
export class HeaderRowComponent implements OnInit {

  @Input()name: string;
  @Input()client: string;
  @Input()project: string;
  @Input()weeks: Date[];

  constructor() { }

  ngOnInit() {
    this.weeks = EntryComponent.weeks;
  }

}
