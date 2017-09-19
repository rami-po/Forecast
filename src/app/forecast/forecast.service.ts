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

  private apiBase = document.location.protocol + '//' + window.location.hostname + ':3000/resource';

  getProjects(params) {
    return this.http.get(this.apiBase + '/project' + params)
      .map((response: Response) => {
        this.projects.next(response.json());
        return response.json();
      })
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

  getGraphData(params) {
    return this.http.get(this.apiBase + '/data/graph' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  getResources(params) {
    params = (!isUndefined(params) ? params : '?active=1');
    return this.http.get(this.apiBase + '/data' + params)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  updateResources(employeeId, fakeEmployeeId, projectId) {
    const body = JSON.stringify({employee_id: employeeId, project_id: projectId, fake_employee_id: fakeEmployeeId});
    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.put('http://onboarding.productops.com:3000/resource/data', body, {headers: headers})
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

  updateRollUps(params) {
    const rollUps = [];
    const rollUps2 = [];

    this.getEmployees('?active=1' + params).subscribe(
      data => {
        const employees = data.result;
        // this.getEntries('').subscribe(
        //   entries => {
        //     let j = 0;
        //     for (let i = 0; i < employees.length; i++) {
        //       const employee = employees[i];
        //       employee.opened = false;
        //       rollUps2.push('');
        //       const entriesTemp = [];
        //       while (j < entries.result.length) {
        //         const entry = entries.result[j];
        //         if (employee.id === entry.employee_id) {
        //           entriesTemp.push(entry);
        //           j++;
        //         } else {
        //           rollUps2.splice(i, 1, entriesTemp);
        //           break;
        //         }
        //       }
        //     }
        //   }
        // );

        for (let i = 0; i < employees.length; i++) {
          const employee = employees[i];
          employee.opened = false;
          rollUps.push('');
          this.getEntries('?employeeid=' + employee.id /* + params */).subscribe(
            entries => {
              if (entries.result.length > 0) {
                rollUps.splice(i, 1, entries.result);
              } else {
                const index = employees.indexOf(employee);
                employees.splice(index, 1);
              }
            }
          );
        }

        this.employees.next(employees);
        this.rollUps.next(rollUps);

        this.getResources('?active=1').subscribe(
          resources => {
            this.resources.next(resources);
          }
        );

        this.getResources('?' + params.substring(1) + '&active=1').subscribe(
          resources => {
            this.filteredResources.next(resources);
          }
        );
      }
    );
  }

}
