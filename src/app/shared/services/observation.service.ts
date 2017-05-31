import { Http, Response } from '@angular/http';
import { Config } from '../config/env.config';
import 'rxjs/Rx';
import { Injectable } from '@angular/core';

@Injectable()
export class ObservationService {

  constructor(private http: Http) {}

  getObservations() {
    return this.http.get('http://fhirtest.uhn.ca/baseDstu3/Observation')
      .map(
        (response: Response) => response.json()
      );
  }

}