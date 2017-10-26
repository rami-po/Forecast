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
import {ReplaySubject} from "rxjs/ReplaySubject";

@Injectable()
export class ForecastService {
  public rollUpsAvailable = false;
  public socket;

  public static NUMBER_OF_WEEKS = 52;

  public overallHours = new Subject<any>();
  overallHours$ = this.overallHours.asObservable();

  public resources = new Subject<any>();
  resources$ = this.resources.asObservable();

  public filteredResources = new Subject<any>();
  filteredResources$ = this.filteredResources.asObservable();

  public rollUps = new Subject<any>();
  rollUps$ = this.rollUps.asObservable();

  public combinedRollUps = new Subject<any>();
  combinedRollUps$ = this.combinedRollUps.asObservable();

  public clients = new Subject<any>();
  clients$ = this.clients.asObservable();

  public projects = new Subject<any>();
  projects$ = this.projects.asObservable();

  public params = new Subject<any>();
  //public params = new BehaviorSubject<any>({path: '', id: ''});
  params$ = this.params.asObservable();

  // BehaviorSubject's have the getValue method, and an initial value.
  // If the initial value is null, we need to check for that value in all subscriptions before using the data
  public allActiveProjects = new BehaviorSubject<any>(null);
  allActiveProjects$ = this.allActiveProjects.asObservable();

  public current = new BehaviorSubject<any>(null);
  current$ = this.current.asObservable();

  public employees = new BehaviorSubject<any>(null);
  employees$ = this.employees.asObservable();

  public allEmployees = new BehaviorSubject<any>(null);
  allEmployees$ = this.allEmployees.asObservable();

  constructor(private http: Http,
              private datePipe: DatePipe,
              private router: Router) {
    this.socket = io(window.location.hostname + ':3000');
  }

  private apiBase = document.location.protocol + '//' + window.location.hostname + ':3000/resource';

  private cache = {};
  private cacheOfObservables = {};

  clearCache(cacheKey) {
    this.cache[cacheKey] = null;
    this.cacheOfObservables[cacheKey] = null;
  }

  updateAllActiveProjects() {
    console.log('updateAllActiveProjects');
    const clearCache = true;
    this.getAllActiveProjects().subscribe(
      data => {
        console.log('updateAllActiveProjects has data'); console.log(data);
        const projects = data.result;
        projects.splice(0, 0, {id: '', name: 'All'});
        console.log(projects);
        this.allActiveProjects.next(projects);
      }
    );
  }

  getAllActiveProjects() {
    return this.http.get(this.apiBase + '/project?active=1')
      .map((response: Response) => {
        this.projects.next(response.json());
        return response.json();
      })
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getProjects(params) {
    console.log('params!: ' + params);
    return this.http.get(this.apiBase + '/project' + params)
      .map((response: Response) => {
        this.projects.next(response.json());
        return response.json();
      })
      .catch((error: Response) => Observable.throw(error.json()));
  }

  // cached version of getProjects with params and shared cache
  getProjectsCached(params) {
    const cacheKey = (isNullOrUndefined(params) ? 'getProjects' : 'getProjects-' + params);
    console.log('new getProjects: ' + params);
    if (!isNullOrUndefined(this.cache[cacheKey])) {
      // if available, just return it as an Observable
      console.log('getProjects: return cached value');
      console.log('actual value'); console.log(this.cache[cacheKey]);
      return Observable.of(this.cache[cacheKey]);
    }
    else if (this.cacheOfObservables[cacheKey]) {
      // request is still in progress, return the Observable
      console.log('getProjects: request in progress, return an Observable');
      return this.cacheOfObservables[cacheKey];
    }
    else {
      // create the request and store the Observable for subsequent subscribers
      console.log('getProjects: cache is empty. start a request');
      this.cacheOfObservables[cacheKey] =  this.http.get(this.apiBase + '/project' + params)
        .map((response:Response) => {
          // data is now available null out the Observable
          this.cacheOfObservables[cacheKey] = null;
          // we could check for response.status here, and return an error if present
          this.cache[cacheKey] = response.json();
          console.log('geProjects: data is now available');
          console.log(this.cache[cacheKey]);
          return this.cache[cacheKey];
        })
        .share();
      // data is not ready yet, return the Observable
      return this.cacheOfObservables[cacheKey];
    }
  }

  /*
  getProjectAndClient(projectId) {
    return this.http.get(this.apiBase + '/project/' + projectId + '/client')
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }
  */

  // cached version of getProjects with params and shared cache
  getProjectAndClient(params) {
    const projectId = params;
    const cacheKey = (isNullOrUndefined(params) ? 'getProjectAndClient' : 'getProjectAndClient-' + params);
    console.log('new getProjectAndClient: ' + params);
    if (!isNullOrUndefined(this.cache[cacheKey])) {
      // if available, just return it as an Observable
      console.log('getProjectAndClient: return cached value');
      return Observable.of(this.cache[cacheKey]);
    } else if (this.cacheOfObservables[cacheKey]) {
      // request is still in progress, return the Observable
      console.log('getProjectAndClient: request in progress, return an Observable');
      return this.cacheOfObservables[cacheKey];
    } else {
      // create the request and store the Observable for subsequent subscribers
      console.log('getProjectAndClient: cache is empty. start a request');
      this.cacheOfObservables[cacheKey] =  this.http.get(this.apiBase + '/project/' + projectId + '/client')
        .map((response: Response) => {
          // data is now available null out the Observable
          this.cacheOfObservables[cacheKey] = null;
          // we could check for response.status here, and return an error if present
          this.cache[cacheKey] = response.json();
          console.log('getProjectAndClient: data is now available');
          console.log(this.cache[cacheKey]);
          return this.cache[cacheKey];
        })
        .share();
      // data is not ready yet, return the Observable
      return this.cacheOfObservables[cacheKey];
    }
  }

  getClientsAndProjects() {
    return this.http.get(this.apiBase + '/clients/projects')
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  removeEmployeeFromProject(projectId, assignmentId, employeeId) {
    return this.http.delete(this.apiBase + '/project/' + projectId + '/assignments/' + assignmentId + '?employee_id=' + employeeId)
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

  updateAllEmployees() {
    console.log('updateAllEmployees');
    const clearCache = false;
    // this.getAllEmployeesCached(clearCache).subscribe(
    this.getAllEmployees(clearCache).subscribe(
      data => {
        console.log('updateAllEmployees has data'); console.log(data);
        this.allEmployees.next(data.result);
      }
    );
  }

  getAllEmployees(unusedParam) {
    console.log('getAllEmployees');
    return this.http.get(this.apiBase + '/employees/all?active=1')
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getAllEmployeesCached(clearCache) {
    const cacheKey = 'getAllEmployees';
    console.log('getAllEmployeesCached:');

    if (clearCache && !isNullOrUndefined(this.cache[cacheKey])) {
      // FYI, we're only clearing the local cache. server cache deals with clearing itself
      console.log('CLEAR CACHE for ' + cacheKey);
      this.cache[cacheKey] = null;
      this.cacheOfObservables[cacheKey] = null;
    }

    if (!isNullOrUndefined(this.cache[cacheKey])) {
      // if available, just return it as an Observable
      return Observable.of(this.cache[cacheKey]);
    } else if (this.cacheOfObservables[cacheKey]) {
      // request is still in progress, return the Observable
      console.log('getAllEmployees: request in progress, return an Observable');
      return this.cacheOfObservables[cacheKey];
    } else {
      // create the request and store the Observable for subsequent subscribers
      console.log('getAllEmployees: cache is empty. start an API request');
      this.cacheOfObservables[cacheKey] =  this.http.get(this.apiBase + '/employees/all')
        .map((response: Response) => {
          // data is now available null out the Observable
          this.cacheOfObservables[cacheKey] = null;
          // we could check for response.status here, and return an error if present
          this.cache[cacheKey] = response.json();
          console.log('getAllEmployees: data is now available');
          return this.cache[cacheKey];
        })
        .share();
      // data is not ready yet, return the Observable
      return this.cacheOfObservables[cacheKey];
    }
  }


  getEmployees(params) {
    console.log('getEmployees' + JSON.stringify(params));
    const idPath = (params.id ? '/' + params.path + '/' + params.id : '');
    const active = (params.active ? '&active=' + params.active : '');
    const real = (params.real ? '&real=' + params.real : '');
    const isContractor = (params.iscontractor ? '&iscontractor=' + params.iscontractor : '');

    // return this.http.get(this.apiBase + '/person' + params)
    return this.http.get(this.apiBase + '/employees' + idPath + '?' + active + real + isContractor)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  updateEmployees(params) {
    this.getEmployeesCached(true).subscribe(
      data => {
        console.log('updateEmployees: ' + JSON.stringify(params)); console.log(data);
        this.employees.next(data.result);
      }
    );
  }

  getEmployeesCached(params) {
    console.log('getEmployees CACHED' + JSON.stringify(params));
    console.log('getEmployees' + JSON.stringify(params));
    const idPath = (params.id ? '/' + params.path + '/' + params.id : '');
    const active = (params.active ? '&active=' + params.active : '');
    const real = (params.real ? '&real=' + params.real : '');
    const isContractor = (params.iscontractor ? '&iscontractor=' + params.iscontractor : '');

    const prefix = 'getEmployeesCached';
    const cacheKey = (isNullOrUndefined(params) ? prefix : prefix + '-' + JSON.stringify(params));
    console.log(prefix + ': ' + params);
    if (!isNullOrUndefined(this.cache[cacheKey])) {
      // if available, just return it as an Observable
      return Observable.of(this.cache[cacheKey]);
    } else if (this.cacheOfObservables[cacheKey]) {
      // request is still in progress, return the Observable
      return this.cacheOfObservables[cacheKey];
    } else {
      // create the request and store the Observable for subsequent subscribers
      console.log('CACHE MISS for ' + cacheKey);
      //    return this.http.get(this.apiBase +
      const request = '/employees' + idPath + '?' + active + real + isContractor;
      this.cacheOfObservables[cacheKey] =  this.http.get(this.apiBase + request)
        .map((response: Response) => {
          // data is now available null out the Observable
          this.cacheOfObservables[cacheKey] = null;
          // we could check for response.status here, and return an error if present
          this.cache[cacheKey] = response.json();
          console.log('data available for ' + cacheKey);
          return this.cache[cacheKey];
        })
        .share();
      // data is not ready yet, return the Observable
      return this.cacheOfObservables[cacheKey];
    }
  }

  putEmployees(employee, params) {
    const body = JSON.stringify(employee);
    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.put(this.apiBase + '/person?page_id=' + params.id, body, {headers: headers})
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
    console.log('getClients: ' + params);
    return this.http.get(this.apiBase + '/client' + params)
      .map((response: Response) => {
        this.clients.next(response.json());
        return response.json();
      })
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getClientsCached(params) {
    const functionName = 'getClientsCached';
    const cacheKey = (isNullOrUndefined(params) ? functionName : functionName + '-' + params);
    console.log(cacheKey);
    if (!isNullOrUndefined(this.cache[cacheKey])) {
      // if available, just return it as an Observable
      console.log('CACHE HIT for ' + cacheKey);
      return Observable.of(this.cache[cacheKey]);
    } else if (this.cacheOfObservables[cacheKey]) {
      // request is still in progress, return the Observable
      console.log('CACHE MISS for cacheKey' + ': request in progress, return an Observable');
      return this.cacheOfObservables[cacheKey];
    } else {
      // create the request and store the Observable for subsequent subscribers
      console.log('CACHE MISS for ' + cacheKey + ': begin API call');
      this.cacheOfObservables[cacheKey] =  this.http.get(this.apiBase + '/client' + params)
        .map((response: Response) => {
          // data is now available null out the Observable
          this.cacheOfObservables[cacheKey] = null;
          // we could check for response.status here, and return an error if present
          this.cache[cacheKey] = response.json();
          console.log('SET CACHE and return data for ' + cacheKey);
          return this.cache[cacheKey];
        })
        .share();
      // data is not ready yet, return the Observable
      return this.cacheOfObservables[cacheKey];
    }
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
    console.log('GET RESOURCES: ' + params);
    params = (!isUndefined(params) ? params : '?active=1');
    return this.http.get(this.apiBase + '/data' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }


  getResourcesCached(params) {
    const functionName = 'getResourcesCached';
    params = (!isUndefined(params) ? params : '?active=1');
    const cacheKey = functionName + '-' + params;
    if (!isNullOrUndefined(this.cache[cacheKey])) {
      // if available, just return it as an Observable
      console.log('CACHE HIT for ' + cacheKey);
      return Observable.of(this.cache[cacheKey]);
    } else if (this.cacheOfObservables[cacheKey]) {
      // request is still in progress, return the Observable
      console.log('CACHE MISS for cacheKey' + ': request in progress, return an Observable');
      return this.cacheOfObservables[cacheKey];
    } else {
      // create the request and store the Observable for subsequent subscribers
      console.log('CACHE MISS for ' + cacheKey + ': begin API call');
      this.cacheOfObservables[cacheKey] =  this.http.get(this.apiBase + '/data' + params)
        .map((response: Response) => {
          // data is now available null out the Observable
          this.cacheOfObservables[cacheKey] = null;
          // we could check for response.status here, and return an error if present
          this.cache[cacheKey] = response.json();
          console.log('SET CACHE and return data for ' + cacheKey);
          return this.cache[cacheKey];
        })
        .share();
      // data is not ready yet, return the Observable
      return this.cacheOfObservables[cacheKey];
    }
  }



  getRollUps(params) {
    console.log('getRollUps:'); console.log(params);
    const clearCache = (!isNullOrUndefined(params.clearcache) ? params.clearcache : false );
    const clearCacheParam = '&clearcache=' + clearCache;

    const openedParam = (params.openEmployees.length > 0 ? '&opened[]=' + params.openEmployees.join('&opened[]=') : '&opened[]');
    const idParam = (params.path && params.id ? '&' + params.path + '_id=' + params.id : '');

    const queryString = '?active=1' + idParam + openedParam + clearCacheParam;
    return this.http.get(this.apiBase + '/rollups' + queryString)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }


  /*
  * params.path [client, project]
  * params.id client or project ID
   *
   */
  // TODO - don't need to cache
  getRollUpsCached(params) {
    const clearCache = (!isNullOrUndefined(params.clearcache) ? params.clearcache : false);
    const clearCacheParam = '&clearcache=' + clearCache;
    const openedParam = (params.openEmployees.length > 1 ? '&opened[]=' + params.openEmployees.join('&opened[]=') : '&opened[]');
    const idParam = (params.path && params.id ? '&' + params.path + 'Id=' + params.id : '');

    const queryString = '?active=1' + idParam + openedParam + clearCacheParam;
    const cacheKey = 'getRollUpsCached?active=1' + idParam;

    console.log(cacheKey); console.log(params);

    if (clearCache && !isNullOrUndefined(this.cache[cacheKey])) {
      console.log('CLEAR CACHE for ' + cacheKey);
      this.cache[cacheKey] = null;
      this.cacheOfObservables[cacheKey] = null;
    }

    if (!isNullOrUndefined(this.cache[cacheKey])) {
      // if available, just return it as an Observable
      console.log('CACHE HIT for ' + cacheKey);
      return Observable.of(this.cache[cacheKey]);
    }
    else if (this.cacheOfObservables[cacheKey]) {
      // request is still in progress, return the Observable
      console.log('CACHE MISS for ' + cacheKey + ': request in progress ');
      return this.cacheOfObservables[cacheKey];
    }
    else {
      // create the request and store the Observable for subsequent subscribers
      console.log('CACHE MISS for ' + cacheKey + ': begin API request');
      this.cacheOfObservables[cacheKey] =  this.http.get(this.apiBase + '/rollups' + queryString)
        .map((response:Response) => {
          // data is now available null out the Observable
          this.cacheOfObservables[cacheKey] = null;
          // we could check for response.status here, and return an error if present
          this.cache[cacheKey] = response.json();
          console.log('CACHE READY ' + cacheKey);
          return this.cache[cacheKey];
        })
        .share();
      // data is not ready yet, return the Observable
      return this.cacheOfObservables[cacheKey];
    }
  }

  updateResources(employeeId, fakeEmployeeId, projectId) {
    const body = JSON.stringify({employee_id: employeeId, project_id: projectId, fake_employee_id: fakeEmployeeId});
    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.put(this.apiBase + '/data', body, {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  deleteFakeAssignment(id, employeeId, projectId) {
    return this.http.delete(this.apiBase + '/assignment/fake/' + id + '?employee_id=' + employeeId + '&project_id=' + projectId)
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
    return this.http.post(this.apiBase + '/graph/data' + params, body, {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  updateRollUps(params) {
    this.rollUpsAvailable = false;
    this.getRollUps(params).subscribe(
      data => {
        console.log('updateRollUps:'); console.log(data);
        this.employees.next(data.employees);
        this.rollUps.next(data.rollUps);
        // need to include the path that was used for these rollups so that we can later decide if we're going to initialize the graph
        data.path = params.path;
        this.combinedRollUps.next(data);
        // overall hours - was originally outside of the getRollUps subscription
        this.updateOverallHours();
        // client/project hours - was originally outside of the getRollUps subscription
        if (params.id !== '') {
          this.updateClientProjectHours(params);
        }
      }
    );
    return null;
  }

  getClientProjectHours(params) {
    return this.http.get(this.apiBase + '/capacity/hours/' + params.path + '/' + params.id)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  updateClientProjectHours(params) {
    this.getClientProjectHours(params).subscribe(
      data => {
        this.filteredResources.next(data.result);
      }
    );
  }

  getOverallHours() {
    return this.http.get(this.apiBase + '/capacity/hours/overall')
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  updateOverallHours() {
    this.getOverallHours().subscribe(
      data => {
        this.resources.next(data.result);
      }
    )
  }

  getUpdateMessages() {
    return new Observable(observer => {
      this.socket.on('updateRollUps', (message) => {
        console.log('received updateRollUps message: ' + JSON.stringify(message));
        observer.next(message);
      });
    });
  }
}
