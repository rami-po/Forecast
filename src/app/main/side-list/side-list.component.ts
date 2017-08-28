import {AfterViewInit, Component, HostListener, Input, OnInit} from '@angular/core';
import {Entry} from "../entry/entry.model";
import {MainComponent} from "../main.component";
import {MainService} from "../main.service";
import {EntryComponent} from "../entry/entry.component";

@Component({
  selector: 'app-side-list',
  templateUrl: './side-list.component.html',
  styleUrls: ['./side-list.component.scss']
})
export class SideListComponent implements OnInit, AfterViewInit {

  @Input() public hasProject = true;
  @Input() public entries;
  @Input() public employees;
  public name: string;

  constructor(
    private mainService: MainService
  ) { }


  ngOnInit() {
    this.mainService.rollUps$.subscribe(
      data => {
        // this.entries = data;
      }
    );
  }

  ngAfterViewInit() {
  }

  getName(entry): string {
    return entry[0].first_name + ' ' + entry[0].last_name;
  }

  updateState(employee) {
    employee.opened = !employee.opened;
  }
}
