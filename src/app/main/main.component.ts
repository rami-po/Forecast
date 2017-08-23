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
  styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit {
  public static numberOfWeeks = 20;
  public entries = [];
  private side;
  private header;
  @Input() private params = '';
  public hasProject = true;

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

    if (this.params !== '') {
      this.hasProject = false;
      const table = document.getElementById('table');
      const forecast = document.getElementById('forecast');
      const title = document.getElementById('title');
      table.style.height = '50vh';
      table.style.width = '85%';
      table.style.marginLeft = '15%';
      this.header.style.marginLeft = '15%';
      this.side.style.width = '15%';
      this.side.style.height = '55vh';
      forecast.style.height = '60vh';
      title.style.width = '15%';
    }

    this.mainService.getEntries(this.params).subscribe(
      data => {
        this.entries = data.result;
      });

    const activeTag = (this.params === '' ? '?' : '&');

    console.log(this.params + activeTag + 'active=1');
    this.mainService.getResources(this.params + activeTag + 'active=1').subscribe(
      data => {
        EntryComponent.resources = data.result;
        HeaderRowComponent.totalCapacities = data.totalCapacities;
      });
  }



  getEntry(firstName: string, lastName: string, employeeId: number, clientName: string, clientId: number,
           projectName: string, projectId: number, weekOf: string, capacity: number): Entry {
    return new Entry(firstName, lastName, employeeId, clientName, clientId, projectName, projectId, weekOf, capacity);
  }

  onScroll($event) {
    this.side.scrollTop = $event.srcElement.scrollTop;
    this.header.scrollLeft = $event.srcElement.scrollLeft;
  }

}
