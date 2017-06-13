import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import { Injectable } from '@angular/core';

@Injectable()
export class ObservationService {

  constructor(private http: Http) {}

  // S streznika pridobimo meritve v obmocju od offset do offset + count in indentifijerjem, ki poskrbi,
  // da dobimo samo meritve, ki smo jih mi vnesli
  getObservations(identifier: string, offset: number, count: number) {
    return this.http.get('https://fhirtest.uhn.ca/baseDstu3/Observation?identifier='
      + identifier + '&_getpagesoffset=' + offset + '&_count=' + count)
      .map(
        (response: Response) => response.json()
      );
  }

  // S streznika pridobimo meritve v obmocju od offset do offset + count in indentifijerjem, ki poskrbi,
  // da dobimo samo meritve, ki smo jih mi vnesli, ter pripadajo pacienti s IDjem patientId
  getObservationsByPatient(identifier: string, offset: number, count: number, patientId: number) {
    return this.http.get('https://fhirtest.uhn.ca/baseDstu3/Observation?identifier='
      + identifier + '&_getpagesoffset=' + offset + '&_count=' + count + '&patient=' + patientId)
      .map(
        (response: Response) => response.json()
      );
  }

  // S streznika pridobimo vse paciente, ki smo si jih kreirali na strezniku, identifier poskrbi, da dobimo sam osvoje paciente
  getPatients(identifier: string) {
    return this.http.get('https://fhirtest.uhn.ca/baseDstu3/Patient?identifier=' + identifier)
      .map(
        (response: Response) => response.json()
      );
  }

  // S streznika pridobimo pacienta s podanim IDjem
  getPatient(id: string) {
    return this.http.get('https://fhirtest.uhn.ca/baseDstu3/' + id)
      .map(
        (response: Response) => response.json()
      );
  }

  // Na streznik posljemo transakcijo v bundle obliki
  post(data: any) {
    return this.http.post('https://fhirtest.uhn.ca/baseDstu3/', data)
      .map (
        (response: Response) => response.json()
      );
  }

  // Na strezniku izbrisemo meritev s podanim IDjem id
  deleteObservation(id: number) {
    return this.http.delete('https://fhirtest.uhn.ca/baseDstu3/Observation/' + id)
      .map (
        (response: Response) => response.json()
      );
  }

}
