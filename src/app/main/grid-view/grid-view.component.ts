import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MainComponent} from "../main.component";
import { DomSanitizer } from '@angular/platform-browser';
import {Entry} from "../entry/entry.model";
import {isNullOrUndefined} from "util";
import {GridViewService} from "./grid-view.service";

@Component({
  selector: 'app-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.scss'],
  providers: [GridViewService]
})
export class GridViewComponent implements OnInit, OnDestroy {

  private static index = 0;
  @Input() public static weeks = [];
  @Input() public static resources: any;
  @Input() public entry: Entry;
  private lastWeek: Date;
  private timerSubscription;
  public row;

  entries = [
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto', 3, 'week', 5)
  ];

  constructor(
    private sanitizer: DomSanitizer,
    private gridViewService: GridViewService
  ) { }

  ngOnInit() {

    this.gridViewService.getResources().subscribe(
      data => {
        console.log(data.result);
        GridViewComponent.resources = data.result;
        this.row = this.sanitizer.bypassSecurityTrustStyle('repeat(' + MainComponent.numberOfWeeks + ', 100px)');
      }
    );

  }


  ngOnDestroy() {
    if (!isNullOrUndefined(this.timerSubscription)) {
      this.timerSubscription.unsubscribe();
    }
  }

  getCapacity(week: Date): string {
    if (!isNullOrUndefined(GridViewComponent.resources)) {
      const resource = GridViewComponent.resources[GridViewComponent.index];
      if (!isNullOrUndefined(resource)) {
        if (resource.employee_id === this.entry.employeeId &&
          resource.client_id === this.entry.clientId &&
          resource.project_id === this.entry.projectId &&
          resource.week_of.substring(0, 10) === week) {
          GridViewComponent.index++;
          if (GridViewComponent.index === GridViewComponent.resources.length) {
            GridViewComponent.index = 0;
          }
          return resource.capacity;
        }
      }
    }
    return '';
  }

  getWeeks(): Date[] {
    return GridViewComponent.weeks;
  }


}
