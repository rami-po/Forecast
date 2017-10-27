import {Component, Input, OnInit} from '@angular/core';
import {ForecastService} from '../../forecast/forecast.service';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {

  @Input() public client;
  public employees;

  constructor(
    private mainService: ForecastService
  ) { }

  ngOnInit() {
    console.log('ngOnInit client-list.components.ts');

    //this.mainService.getEmployees('?active=1&clientId=' + this.client.id).subscribe(
    this.mainService.getEmployees({active: '1', path: 'client', id: this.client.id}).subscribe(
      data => {
        console.log(this.client);
        this.employees = data.result;
      }
    );

  }

}
