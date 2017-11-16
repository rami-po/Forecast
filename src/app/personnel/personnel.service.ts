/**
 * Created by Rami Khadder on 11/8/2017.
 */
import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

@Injectable()
export class PersonnelService {

  constructor(private http: Http) {
  }

  private apiBase = document.location.protocol + '//' + window.location.hostname + ':3000/resource';



  getNotes(id) {
    return this.http.get(this.apiBase + '/personnel/notes/' + id)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  addNotes(id, notes) {
    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.post(this.apiBase + '/personnel/notes', JSON.stringify({id: id, notes: notes}), {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  addSkills(id, skill) {
    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.post(this.apiBase + '/personnel/skills', JSON.stringify({id: id, skill: skill}), {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  addTimelineEvent(id, date, type, event) {
    const body = {
      id: id,
      date: date,
      type: type,
      event: event
    };

    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.post(this.apiBase + '/personnel/timeline', JSON.stringify(body), {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

}
