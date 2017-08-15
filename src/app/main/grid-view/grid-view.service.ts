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
    return this.http.get('http://localhost:3000/resource/capacity')
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

}
