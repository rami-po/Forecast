/**
 * Created by Rami Khadder on 8/9/2017.
 */
import { Injectable } from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {Entry} from './entry.model';

@Injectable()
export class EntryService {
  constructor(private http: Http) { }

  updateResourceManagement(entry: Entry, weekOf: string, capacity: number) {
    entry.weekOf = weekOf;
    entry.capacity = capacity;
    const body = JSON.stringify(entry);
    const headers = new Headers({'Content-Type': 'application/json'});

    return this.http.post('http://localhost:3000/resource/entry', body, {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

}
