/**
 * Created by Rami Khadder on 8/9/2017.
 */
import {Injectable, Input} from '@angular/core';
import 'rxjs/Rx';
import {Subject} from "rxjs/Subject";
import {ForecastService} from "../forecast.service";

@Injectable()
export class SideListService {

  constructor(private forecastService: ForecastService) {
  }

  deleteFake(fakeProjectId, fakeEmployeeId, params) {

  }

}
