import {Component, Input, OnInit} from '@angular/core';
import {MainService} from "../../main/main.service";

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {

  @Input() public client;
  public employees;

  constructor(
    private mainService: MainService
  ) { }

  ngOnInit() {

    this.mainService.getEmployees('?active=1&clientId=' + this.client.id).subscribe(
      data => {
        this.employees = data.result;
      }
    );

  }

}
