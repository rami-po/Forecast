/**
 * Created by Rami Khadder on 8/9/2017.
 */
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';
import {DatePipe} from '@angular/common';
import {isNullOrUndefined, isUndefined} from 'util';
import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import * as io from 'socket.io-client';
import {Router} from "@angular/router";

@Injectable()
export class ForecastService {
  public socket;

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

  public current = new BehaviorSubject<any>(null);
  current$ = this.current.asObservable();

  // employees needs to be a BehaviorSubject so that we can use the getValue method
  public employees = new BehaviorSubject<any>(null);
  employees$ = this.employees.asObservable();

  public params = new Subject<any>();
  params$ = this.params.asObservable().startWith({id: '', path: '', openEmployees: []});

  constructor(private http: Http,
              private datePipe: DatePipe,
              private router: Router) {
    this.socket = io(window.location.hostname + ':3000');
  }

  private apiBase = document.location.protocol + '//' + window.location.hostname + ':3000/resource';

  getProjects(params) {
    return this.http.get(this.apiBase + '/project' + params)
      .map((response: Response) => {
        this.projects.next(response.json());
        return response.json();
      })
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getProjectAndClient(projectId) {
    return this.http.get(this.apiBase + '/project/' + projectId + '/client')
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getClientsAndProjects() {
    return this.http.get(this.apiBase + '/clients/projects')
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  removeEmployeeFromProject(projectId, assignmentId) {
    return this.http.delete(this.apiBase + '/project/' + projectId + '/assignments/' + assignmentId)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  addEmployeeToProject(projectId, employeeId) {
    const body = JSON.stringify({user: {id: employeeId}});
    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.post(this.apiBase + '/project/' + projectId + '/assignments', body, {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getEmployees(params) {
    return this.http.get(this.apiBase + '/person' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  putEmployees(employee) {
    const body = JSON.stringify(employee);
    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.put(this.apiBase + '/person', body, {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  addFakeEmployee(name, projectId) {
    const body = JSON.stringify({name: name, project_id: projectId});
    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.post(this.apiBase + '/person/fake', body, {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  putFakeEmployees(employee) {
    const body = JSON.stringify(employee);
    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.put(this.apiBase + '/person/fake', body, {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getClients(params) {
    return this.http.get(this.apiBase + '/client' + params)
      .map((response: Response) => {
        this.clients.next(response.json());
        return response.json();
      })
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getAssignments(params) {
    return this.http.get(this.apiBase + '/assignment' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getEntries(params) {
    return this.http.get(this.apiBase + '/entry' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getMembers(params) {
    return this.http.get(this.apiBase + '/member' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getTimeEntries(params) {
    return this.http.get(this.apiBase + '/time' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getAllTimeEntries(params) {
    return this.http.get(this.apiBase + '/time/all' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getHours(params) {
    return this.http.get(this.apiBase + '/time/hours' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getTier(params) {
    return this.http.get(this.apiBase + '/tier' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getResources(params) {
    params = (!isUndefined(params) ? params : '?active=1');
    return this.http.get(this.apiBase + '/data' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getRollUps(params) {
    return this.http.get(this.apiBase + '/rollups' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  updateResources(employeeId, fakeEmployeeId, projectId) {
    const body = JSON.stringify({employee_id: employeeId, project_id: projectId, fake_employee_id: fakeEmployeeId});
    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.put(this.apiBase + '/data', body, {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  deleteFakeAssignment(id) {
    return this.http.delete(this.apiBase + '/assignment/fake/' + id)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  deleteFakeEmployee(id) {
    return this.http.delete(this.apiBase + '/person/fake/' + id)
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

  getGraphData(params, body) {
    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.post(this.apiBase + '/data/graph' + params, body, {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  updateRollUps(params) {
    const rollUps = [];
    let opened = (params.openEmployees.length > 1 ? '&opened[]=' + params.openEmployees.join('&opened[]=') : '&opened[]');
    this.getRollUps('?active=1&' + params.path + 'Id=' + params.id + opened).subscribe(
      data => {
        this.employees.next(data.employees);
        this.rollUps.next(data.rollUps);
      }
    );

    this.getResources('?active=1&slim=1').subscribe(
      resources => {
        this.resources.next(resources.result);
      }
    );

    if (params.id !== '') {
      this.getResources('?' + params.path + 'Id=' + params.id + '&active=1&slim=1').subscribe(
        resources => {
          this.filteredResources.next(resources.result);
        }
      );
    }
  }

  getUpdateMessages() {
    let observable = new Observable(observer => {
      this.socket.on('updateRollUps', (message) => {
        console.log('received message to update roll ups: ' + message);
        observer.next(message);
      });
    });
    return observable;
  }
}
