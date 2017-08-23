import {Component, HostListener, Input, OnInit} from '@angular/core';
import {Entry} from "../entry/entry.model";
import {MainComponent} from "../main.component";

@Component({
  selector: 'app-side-list',
  templateUrl: './side-list.component.html',
  styleUrls: ['./side-list.component.scss']
})
export class SideListComponent implements OnInit {

  @Input() public hasProject = true;

  constructor() { }

  @Input() public entry: Entry;

  ngOnInit() {
  }

}
