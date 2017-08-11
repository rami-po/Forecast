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

  updateResourceManagement(entry: Entry, weekOf: Date, capacity: number) {
    entry.weekOf = this.convert(weekOf);
    entry.capacity = capacity;
    const body = JSON.stringify(entry);
    const headers = new Headers({'Content-Type': 'application/json'});

    return this.http.post('http://localhost:3000/resource/entry', body, {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  convert(date): string {
    const mm = date.getMonth() + 1; // getMonth() is zero-based
    const dd = date.getDate();

    return [date.getFullYear(),
      (mm > 9 ? '' : '0') + mm,
      (dd > 9 ? '' : '0') + dd
    ].join('');
  }

}
