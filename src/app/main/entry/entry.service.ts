/**
 * Created by Rami Khadder on 8/9/2017.
 */
import { Injectable } from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

@Injectable()
export class MainService {
  constructor(private http: Http) { }

  updateResourceManagement() {
    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.post('http://onboarding.productops.com/server/create/home', body, {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }
}
