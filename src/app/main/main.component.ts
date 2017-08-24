/**
 * Created by Rami Khadder on 8/7/2017.
 */
import {Component, Input, OnInit} from '@angular/core';
import {Entry} from './entry/entry.model';
import {MainService} from './main.service';
import {EntryComponent} from './entry/entry.component';
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
  private table;
  private forecast;
  @Input() private params = '';
  public hasProject = false;

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

    // if it isn't the main route
    if (this.params !== '') {
      this.hasProject = true;
      this.table = document.getElementById('table');
      this.forecast = document.getElementById('forecast');
      const title = document.getElementById('title');
      const name = document.getElementById('name');
      this.table.style.height = '50vh';
      this.table.style.width = '85%';
      this.table.style.marginLeft = '15%';
      this.header.style.marginLeft = '15%';
      this.side.style.width = '15%';
      this.side.style.height = '45vh';
      this.forecast.style.height = '60vh';
      title.style.width = '15%';
      name.style.width = '100%';
    }

    this.mainService.getEntries(this.params).subscribe(
      data => {
        this.entries = data.result;
        if (this.entries.length <= 5 && this.hasProject) {
          console.log(this.entries.length);
          const pixels = this.entries.length * 70.5;
          console.log(pixels);
          this.table.style.height = pixels + 'px';
          this.table.style.overflowY = 'hidden';
          this.header.style.marginRight = '0px';
          this.forecast.style.height = Number(pixels + 64) + 'px';
        }
      });

    const activeTag = (this.params === '' ? '?' : '&');

    console.log(this.params + activeTag + 'active=1');
    this.mainService.getResources(this.params + activeTag + 'active=1').subscribe(
      data => {
        EntryComponent.resources = data.result;
        // HeaderRowComponent.totalCapacities = data.totalCapacities;
        console.log(data.totalCapacities);
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
