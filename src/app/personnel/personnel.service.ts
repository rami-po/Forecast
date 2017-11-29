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

  uploadPicture(id, picture) {
    const headers = new Headers({'Content-Type': 'image/jpeg'});
    const h = new Headers({'Encoding-Type': 'multipart/form-data'});

    console.log(picture.get('file'));
    console.log(picture);
    return this.http.post(this.apiBase + '/personnel/picture', picture)
      .map((response: Response) => {
        console.log(response.json());
        return response.json();
      })
      .catch((error: Response) => Observable.throw(error.json()));
  }

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

  removeNote(note) {
    console.log(note.id);
    return this.http.delete(this.apiBase + '/personnel/notes/' + note.id)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  addSkills(id, skill) {
    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.post(this.apiBase + '/personnel/skills', JSON.stringify({
      id: id,
      skill: skill
    }), {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  removeSkill(skill) {
    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.delete(this.apiBase + '/personnel/skills/' + skill.id)
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

  removeTimelineEvent(event) {
    return this.http.delete(this.apiBase + '/personnel/timeline/' + event.id)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

}
