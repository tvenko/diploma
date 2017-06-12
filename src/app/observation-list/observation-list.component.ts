import { Component, OnInit } from '@angular/core';
import { ObservationService } from '../shared/services/observation.service';
import { IndexedDBService } from '../shared/services/indexeddb.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-observations-list',
  templateUrl: './observation-list.component.html',
  styleUrls: ['./observation-list.component.css']
})
export class ObservationListComponent implements OnInit {

  observations: any[];
  patients: any[] = [];
  patient: any;
  user: {name: string, surname: string, email: string, password: string, id: number};
  observationsError: boolean;
  observationsWaiting: boolean;
  offline = false;
  page = 1;
  total = 10;
  offset = 20;

  constructor(private observationService: ObservationService,
              private indexedDB: IndexedDBService,
              private router: Router) { }

  ngOnInit() {
    this.user = this.indexedDB.getUser();
    this.getObservations();
    this.getPatients();
  }

  getObservations() {
    this.observationsWaiting = false;
    if (this.patient) {
      this.observationsWaiting = true;
      this.observationService.getObservationsByPatient
      ('patronaza1', (this.page * 10 - 10), this.offset, this.patient.resource.id).subscribe(
        response => {
          if (response.entry) {
            this.observationsWaiting = false;
            this.offline = false;
            this.observations = response.entry;
            this.total = response.total;
            for (const observation of this.observations) {
              this.observationService.getPatient(observation.resource.subject.reference).subscribe(
                response1 => {
                  observation.patient = response1;
                }
              );
            }
          } else {
            this.observationsWaiting = false;
            this.offline = false;
            this.observationsError = true;
          }
        },
        error => {
          console.log('Meritev ni bilo mogoce pridobiti');
          const patientId: string = 'Patient/' + this.patient.resource.id;
          console.log(patientId);
          this.indexedDB.getObservationRange((this.page * 10 - 10), (this.page * 10 - 10) + this.offset, patientId).then((response) => {
            this.observations = response[1];
            setTimeout(() => {
              this.total = this.observations.length;
              for (const observation of this.observations) {
                const id = observation.resource.subject.reference.substring(8);
                this.indexedDB.getPatient(id).then((patient) => {
                  observation.patient = patient;
                });
              }
              console.log(this.observations);
              if (this.total === 0) {
                this.observationsError = true;
              }
              }, 100);
            this.indexedDB.getAllObservations().then((all) => this.total = all.length);
          });
          this.offline = true;
          this.observationsWaiting = false;
        },
      );
    }
  }

  getPatients() {
    this.observationService.getPatients('patronaza1').subscribe(
      response => this.patients = response.entry,
      error => {
        console.log('pacientov ni bilo mogoce pridoviti');
        this.indexedDB.getAllPatients().then((response: any) => {
          for (const patient of response) {
            this.patients.push(patient.patient);
          }
        });
      }
    );
  }

  onDelete(observation, i) {
    this.observationService.delete(observation.resource.id).subscribe(
      response => {
        this.observations.splice(i, i);
        this.indexedDB.deleteObservtion(observation.resource.id);
      });
  }
}
