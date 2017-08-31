import {Component, OnInit} from '@angular/core';
import {ForecastService} from '../forecast/forecast.service';

@Component({
  selector: 'app-bob',
  templateUrl: './bob.component.html',
  styleUrls: ['./bob.component.scss']
})
export class BobComponent implements OnInit {

  public clients;

  constructor(private mainService: ForecastService) {
  }

  ngOnInit() {

    this.mainService.getClients('?active=1').subscribe(
      data => {
        this.clients = data.result;
        console.log(this.clients.length);
      }
    );
  }

}
