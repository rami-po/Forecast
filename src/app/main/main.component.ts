/**
 * Created by Rami Khadder on 8/7/2017.
 */
import { Component, OnInit } from '@angular/core';
import {Entry} from './entry/entry.model';
import {MainService} from './main.service';
import {Observable} from 'rxjs/Observable';
import {EntryComponent} from "./entry/entry.component";
import {HeaderRowComponent} from "./header-row/header-row.component";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  providers: [MainService],
  styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit {
  public entries = [];
  private numberOfWeeks = 20;

  constructor(
    private mainService: MainService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {

    const monday = this.getMonday();
    for (let i = 0; i < this.numberOfWeeks; i++) {
      const date = new Date(monday.toDateString());
      EntryComponent.weeks.push(this.datePipe.transform(date, 'yyyy-MM-dd'));
      monday.setDate(monday.getDate() + 7);
    }

    this.mainService.getEntries().subscribe(
      data => {
        this.entries = data.result;
      });

    this.mainService.getResources().subscribe(
      data => {
        EntryComponent.resources = data.result;
        HeaderRowComponent.totalCapacities = data.totalCapacities;
      });
  }

  getEntry(firstName: string, lastName: string, employeeId: number, clientName: string, clientId: number,
           projectName: string, projectId: number, weekOf: string, capacity: number): Entry {
    return new Entry(firstName, lastName, employeeId, clientName, clientId, projectName, projectId, weekOf, capacity);
  }

  getMonday(): Date {
    const date = new Date();
    while (date.getDay() !== 1) {
      date.setDate(date.getDate() - 1);
    }
    return date;
  }

}
