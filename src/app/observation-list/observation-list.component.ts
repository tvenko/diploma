import { Component, OnInit } from '@angular/core';
import { ObservationService } from '../shared/services/observation.service';
import { IndexedDBService } from '../shared/services/indexeddb.service';
import { Router } from '@angular/router';
import {ObservationInputComponent} from '../observation-input/observation-input.component';

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
  patientError = false;
  patientSpinner = true;
  observationAmount = 0;
  page = 1;
  total = 10;
  offset = 20;

  constructor(private observationService: ObservationService,
              private indexedDB: IndexedDBService,
              private router: Router,
              private observationInput: ObservationInputComponent) { }

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
      response => {
        this.patients = response.entry;
        this.patientSpinner = false;
      },
      error => {
        console.log('pacientov ni bilo mogoce pridoviti');
        this.indexedDB.getAllPatients().then((response: any) => {
          if (response) {
            for (const patient of response) {
              this.patients.push(patient.patient);
            }
          } else {
            this.patientError = true;
          }
          this.patientSpinner = false;
        });
      }
    );
  }

  onDelete(observation, i = -1) {
    this.indexedDB.addToDeleteQueue(observation.resource.id).then(() => {
      if (i > 0) {
        this.observations.splice(i, i);
      }
      this.indexedDB.getAllObservationsDeleteQueue().then((observations: any) => {
        if (observations) {
          for (const id of observations) {
            this.indexedDB.deleteObservtion(id);
            this.observationService.delete(id).subscribe(
              response => this.indexedDB.deleteObservationDeleteQueue(id)
            );
          }
        }
      });
    });
  }

  onSinc() {
    this.observationInput.postObservation();
    this.observationAmount = this.observationInput.observationsAmount;
    // todo najbrz bo napaka ker pri onDelete se enkrat dodajamo v delteQueue in bo vrnil error zato se ne bo brisalo na serverju.
    this.indexedDB.getAllObservationsDeleteQueue().then((observations: any) => {
      if (observations) {
        for (const observation of observations) {
          this.onDelete(observation);
        }
      }
    });
  }
}
