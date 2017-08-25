/**
 * Created by Rami Khadder on 8/9/2017.
 */
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {DatePipe} from '@angular/common';
import {isUndefined} from "util";
import {Subject} from "rxjs/Subject";

@Injectable()
export class MainService {


  // 172.30.1.108 - EC2
  // 127.0.0.1 - Local-host
  public static ROUTING_BACKEND = '172.30.1.108' + ':3000';
  public static NUMBER_OF_WEEKS = 20;
  private test = new Subject<any>();
  test$ = this.test.asObservable();

  constructor(private http: Http,
              private datePipe: DatePipe) {
  }

  getProjects(params) {
    return this.http.get('http://' + MainService.ROUTING_BACKEND + '/resource/project' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getEmployees(params) {
    return this.http.get('http://' + MainService.ROUTING_BACKEND + '/resource/person' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getClients(params) {
    return this.http.get('http://' + MainService.ROUTING_BACKEND + '/resource/client' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getAssignments() {
    return this.http.get('http://' + MainService.ROUTING_BACKEND + '/resource/assignment')
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getEntries(params) {
    return this.http.get('http://' + MainService.ROUTING_BACKEND + '/resource/entry' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getMembers(params) {
    return this.http.get('http://' + MainService.ROUTING_BACKEND + '/resource/member' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getTimeEntries(params) {
    return this.http.get('http://' + MainService.ROUTING_BACKEND + '/resource/time' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getResources(params) {
    params = (!isUndefined(params) ? params : '?active=1');
    return this.http.get('http://' + MainService.ROUTING_BACKEND + '/resource/data' + params)
      .map((response: Response) => {
        this.test.next(response.json());
        return response.json();
      })
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
