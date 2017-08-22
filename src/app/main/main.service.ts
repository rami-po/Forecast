/**
 * Created by Rami Khadder on 8/9/2017.
 */
import { Injectable } from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {DatePipe} from '@angular/common';

@Injectable()
export class MainService {

  public static NUMBER_OF_WEEKS = 20;

  constructor(
    private http: Http,
    private datePipe: DatePipe
  ) { }

  getProjects(param) {
    return this.http.get('http://localhost:3000/resource/project' + param)
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

  getEntries(params) {
    return this.http.get('http://localhost:3000/resource/entry' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getResources(params) {
    return this.http.get('http://localhost:3000/resource/data' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getMonday(d): Date {
    const date = new Date(d);
    while (date.getDay() !== 1) {
      date.setDate(date.getDate() - 1);
    }
    return date;
  }

  getWeeks(monday): string[] {
    const weeks = [];
    for (let i = 0; i < MainService.NUMBER_OF_WEEKS; i++) {
      const date = new Date(monday.toDateString());
      weeks.push(this.datePipe.transform(date, 'yyyy-MM-dd'));
      monday.setDate(monday.getDate() + 7);
    }
    return weeks;
  }

}
