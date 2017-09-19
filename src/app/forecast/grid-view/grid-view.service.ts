/**
 * Created by Rami Khadder on 8/15/2017.
 */
import { Injectable } from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

@Injectable()
export class GridViewService {
  constructor(private http: Http) { }

  getResources() {
    return this.http.get(document.location.protocol + '//' + window.location.hostname + ':3000/resource')
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

}
