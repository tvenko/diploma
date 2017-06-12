import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import { Injectable } from '@angular/core';

@Injectable()
export class ObservationService {

  constructor(private http: Http) {}

  getObservations(identifier: string, offset: number, count: number) {
    return this.http.get('http://fhirtest.uhn.ca/baseDstu3/Observation?identifier='
      + identifier + '&_getpagesoffset=' + offset + '&_count=' + count)
      .map(
        (response: Response) => response.json()
      );
  }

  getObservationsByPatient(identifier: string, offset: number, count: number, patientId: number) {
    return this.http.get('http://fhirtest.uhn.ca/baseDstu3/Observation?identifier='
      + identifier + '&_getpagesoffset=' + offset + '&_count=' + count + '&patient=' + patientId)
      .map(
        (response: Response) => response.json()
      );
  }

  getPatients(identifier: string) {
    return this.http.get('http://fhirtest.uhn.ca/baseDstu3/Patient?identifier=' + identifier)
      .map(
        (response: Response) => response.json()
      );
  }

  getPatient(id: string) {
    return this.http.get('http://fhirtest.uhn.ca/baseDstu3/' + id)
      .map(
        (response: Response) => response.json()
      );
  }

  post(data: any) {
    return this.http.post('http://fhirtest.uhn.ca/baseDstu3/', data)
      .map (
        (response: Response) => response.json()
      );
  }

  delete(id: number) {
    return this.http.delete('http://fhirtest.uhn.ca/baseDstu3/Observation/' + id)
      .map (
        (response: Response) => response.json()
      );
  }

}
