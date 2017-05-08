import { Http, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ObiskiService {
  constructor(private http: Http) {}

  get(user: string) {
    return this.http.get('http://localhost:8000/api/v1/obiski/obiski?user=' + user)
      .map(
        (response: Response) => response.json()
      );
  }
}
