import { Injectable } from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {Subject} from "rxjs/Subject";

@Injectable()
export class FunnelService {

  private apiBase = document.location.protocol + '//' + window.location.hostname + ':3000/resource';

  funnelItems = new Subject<any>();
  funnelItems$ = this.funnelItems.asObservable();

  constructor(private http: Http) { }

  updateFunnelItems() {
    this.getFunnelItems().subscribe(
      data => {
        this.funnelItems.next(data.result);
      }
    );
  }

  getFunnelItems() {
    return this.http.get(this.apiBase + '/funnel')
      .map((response: Response) => {
        this.funnelItems.next(response.json());
        return response.json();
      })
      .catch((error: Response) => Observable.throw(error.json()));
  }

  deleteFunnelItem(item) {
    return this.http.delete(this.apiBase + '/funnel?id=' + item.id)
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  addFunnelItem(item) {
    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.post(this.apiBase + '/funnel', item, {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

  updateFunnelItem(item) {
    console.log(item);
    const headers = new Headers({'Content-Type': 'application/json'});
    return this.http.put(this.apiBase + '/funnel', item, {headers: headers})
      .map((response: Response) => response.json())
      .catch((error: Response) => Observable.throw(error.json()));
  }

}
