/**
 * Created by Rami Khadder on 8/9/2017.
 */
import {Injectable, Input} from '@angular/core';
import 'rxjs/Rx';
import {Subject} from "rxjs/Subject";

@Injectable()
export class RollUpService {

  public totalCapacities = new Subject<any>();
  totalCapacities$ = this.totalCapacities.asObservable();

  constructor() { }



}
