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

  getProjects() {
    return this.http.get('http://localhost:3000/resource/project')
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getEmployees() {
    return this.http.get('http://localhost:3000/resource/person')
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getClients() {
    return this.http.get('http://localhost:3000/resource/client')
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getAssignments() {
    return this.http.get('http://localhost:3000/resource/assignment')
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getEntries() {
    return this.http.get('http://localhost:3000/resource/entry')
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getCapacities() {
    return this.http.get('http://localhost:3000/resource/capacity')
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }
}
