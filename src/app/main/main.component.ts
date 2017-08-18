/**
 * Created by Rami Khadder on 8/7/2017.
 */
import {Component, HostListener, Input, OnInit} from '@angular/core';
import {Entry} from './entry/entry.model';
import {MainService} from './main.service';
import {Observable} from 'rxjs/Observable';
import {EntryComponent} from './entry/entry.component';
import {HeaderRowComponent} from './header-row/header-row.component';
import {DatePipe} from '@angular/common';
import {GridViewComponent} from './grid-view/grid-view.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  providers: [MainService],
  styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit {
  public static numberOfWeeks = 20;
  public entries = [];
  private side;
  private header;
  @Input() private params = '';

  constructor(
    private mainService: MainService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
   this.side = document.getElementById('side');
   this.header = document.getElementById('header');

    const monday = this.mainService.getMonday(new Date());
    const weeks = this.mainService.getWeeks(monday);
    EntryComponent.setWeeks(weeks);
    GridViewComponent.weeks = weeks;

    this.mainService.getEntries(this.params).subscribe(
      data => {
        this.entries = data.result;
      });

    this.mainService.getResources(this.params).subscribe(
      data => {
        EntryComponent.resources = data.result;
        HeaderRowComponent.totalCapacities = data.totalCapacities;
      });
  }



  getEntry(firstName: string, lastName: string, employeeId: number, clientName: string, clientId: number,
           projectName: string, projectId: number, weekOf: string, capacity: number): Entry {
    return new Entry(firstName, lastName, employeeId, clientName, clientId, projectName, projectId, weekOf, capacity);
  }

  @HostListener('window:scroll', ['$event']) onScrollEvent($event) {
    this.side.scrollTop = $event.currentTarget.scrollY;
    this.header.scrollLeft = $event.currentTarget.scrollX;
  }

}
