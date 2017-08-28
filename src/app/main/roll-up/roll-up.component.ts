import {Component, Input, OnInit} from '@angular/core';
import {Entry} from "../entry/entry.model";
import {MainService} from "../main.service";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-roll-up',
  templateUrl: './roll-up.component.html',
  styleUrls: ['./roll-up.component.scss']
})
export class RollUpComponent implements OnInit {

  @Input() public employee;
  @Input() public data;
  @Input() public row;

  public entries = [];
  public totalCapacities;

  constructor(
    private mainService: MainService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.mainService.getResources('?employeeId=' + this.employee.id).subscribe(
      data => {
        this.totalCapacities = data.totalCapacities;
        const monday = this.datePipe.transform(this.mainService.getMonday(new Date()), 'yyyy-MM-dd');
        let index = -1;
        for (let i = 0; i < data.result.length; i++) {
          if (data.result[i].week_of.substring(0, 10) === monday) {
           this.entries.push([]);
           index++;
          }
          this.entries[index].push(data.result[i].capacity);
        }
      }
    );

  }

  getEntry(firstName: string, lastName: string, employeeId: number, clientName: string, clientId: number,
           projectName: string, projectId: number, weekOf: string, capacity: number, boxNumber: number): Entry {
    return new Entry(firstName, lastName, employeeId, clientName, clientId, projectName, projectId, weekOf, capacity, boxNumber);
  }

}
