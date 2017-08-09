/**
 * Created by Rami Khadder on 8/7/2017.
 */
import { Component, OnInit } from '@angular/core';
import {Entry} from './entry/entry.model';
import {MainService} from './main.service';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  providers: [MainService],
  styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit {
  entries2 = [
    new Entry('Rami', 1, 'productOps', 1, 'Scala', 1, 'one'),
    new Entry('Test', 2, 'TEst', 2, 'TEST', 2, 'two'),
    new Entry('Test', 3, 'TEst', 3, 'TEST', 3, 'three'),
    new Entry('Test', 4, 'TEst', 4, 'TEST', 4, 'four'),
    new Entry('Test', 5, 'TEst', 5, 'TEST', 5, 'five'),
    new Entry('Test', 6, 'TEst', 6, 'TEST', 6, 'six'),
  ];

  space = ' ';
  entries = [];

  employees = [];
  projects = [];
  clients = [];
  assignments = [];

  constructor(
    private mainService: MainService
  ) { }

  ngOnInit() {

    this.mainService.getEntries().subscribe(
      data => {
        console.log(data);
        this.entries = data.result;
      });
  }

  getEntry(employeeName: string, employeeId: number, clientName: string, clientId: number,
           projectName: string, projectId: number, weekOf: string): Entry {
    return new Entry(employeeName, employeeId, clientName, clientId, projectName, projectId, weekOf);
  }
}
