/**
 * Created by Rami Khadder on 8/9/2017.
 */
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import {DatePipe} from '@angular/common';
import {isUndefined} from 'util';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class ForecastService {

  public static NUMBER_OF_WEEKS = 20;

  public resources = new Subject<any>();
  resources$ = this.resources.asObservable();

  public filteredResources = new Subject<any>();
  filteredResources$ = this.filteredResources.asObservable();

  public rollUps = new Subject<any>();
  rollUps$ = this.rollUps.asObservable();

  public clients = new Subject<any>();
  clients$ = this.clients.asObservable();

  public projects = new Subject<any>();
  projects$ = this.clients.asObservable();

  public employees = new Subject<any>();
  employees$ = this.employees.asObservable();

  public params = new Subject<any>();
  params$ = this.params.asObservable().startWith('');

  constructor(private http: Http,
              private datePipe: DatePipe) {
  }

  getProjects(params) {
    return this.http.get('http://onboarding.productops.com:3000/resource/project' + params)
      .map((response: Response) => {
        this.projects.next(response.json());
        return response.json();
      })
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getEmployees(params) {
    return this.http.get('http://onboarding.productops.com:3000/resource/person' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  putEmployees(employee) {
    const body = JSON.stringify(employee);
    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.put('http://onboarding.productops.com:3000/resource/person', body, {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getClients(params) {
    return this.http.get('http://onboarding.productops.com:3000/resource/client' + params)
      .map((response: Response) => {
        this.clients.next(response.json());
        return response.json();
      })
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getAssignments() {
    return this.http.get('http://onboarding.productops.com:3000/resource/assignment')
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getEntries(params) {
    return this.http.get('http://onboarding.productops.com:3000/resource/entry' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getMembers(params) {
    return this.http.get('http://onboarding.productops.com:3000/resource/member' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getTimeEntries(params) {
    return this.http.get('http://onboarding.productops.com:3000/resource/time' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getResources(params) {
    params = (!isUndefined(params) ? params : '?active=1');
    return this.http.get('http://onboarding.productops.com:3000/resource/data' + params)
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
    for (let i = 0; i < ForecastService.NUMBER_OF_WEEKS; i++) {
      const date = new Date(monday.toDateString());
      weeks.push(this.datePipe.transform(date, 'yyyy-MM-dd'));
      monday.setDate(monday.getDate() + 7);
    }
    return weeks;
  }

}
