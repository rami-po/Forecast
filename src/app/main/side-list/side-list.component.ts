import {Component, HostListener, Input, OnInit} from '@angular/core';
import {Entry} from "../entry/entry.model";
import {MainComponent} from "../main.component";

@Component({
  selector: 'app-side-list',
  templateUrl: './side-list.component.html',
  styleUrls: ['./side-list.component.scss']
})
export class SideListComponent implements OnInit {

  constructor() { }

  @Input() public entry: Entry;

  entries = [
    new Entry('first', 'last', 1, 'client', 2, 'proyecto1', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto2', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto3', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto4', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto5', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto6', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto7', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto8', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto9', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto0', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto1', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto2', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto3', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto4', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto5', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto6', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto7', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto8', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto9', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto0', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto1', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto2', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto3', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto4', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto5', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto6', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto7', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto8', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto9', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto0', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto1', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto2', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto3', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto4', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto5', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto6', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto7', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto8', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto9', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto0', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto1', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto2', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto3', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto4', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto5', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto6', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto7', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto8', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto9', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto0', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto1', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto2', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto3', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto4', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto5', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto6', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto7', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto8', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto9', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto0', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto1', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto2', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto3', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto4', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto5', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto6', 3, 'week', 5),
    new Entry('first', 'last', 1, 'client', 2, 'proyecto7', 3, 'week', 5)
  ];

  ngOnInit() {
  }

}
