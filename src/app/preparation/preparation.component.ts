import { Component, OnInit } from '@angular/core';
import { ObservationService } from '../shared/services/observation.service';
import { FormControl } from '@angular/forms';
import { IndexedDBService } from '../shared/services/indexeddb.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preparation',
  templateUrl: './preparation.component.html',
  styleUrls: ['./preparation.component.css']
})
export class PreparationComponent implements OnInit {

  patientCtrl: FormControl;
  filteredPatients: any;

  patients = [];
  patient: any;
  localPatients = [];

  constructor(private observationService: ObservationService,
              private indexedDB: IndexedDBService,
              private router: Router) {
    this.patientCtrl = new FormControl();
    this.filteredPatients = this.patientCtrl.valueChanges
      .startWith(null)
      .map(name => this.filterStates(name));
  }

  ngOnInit() {
    this.observationService.getPatients('patronaza1').subscribe(
      response => {
        for (const el of response.entry) {
          this.patients.push(el);
        }
      }, error => console.log(error)
    );
    setTimeout(() => {
      this.indexedDB.getAllPatients().then((response: any) => {
        if (response) {
          for (const el of response) {
            this.localPatients.push(el.patient);
          }
        }
      });
    }, 1000);
    console.log(this.localPatients);
  }

  filterStates(val: string) {
    return val ? this.patients.filter(s => s.toLowerCase().indexOf(val.toLowerCase()) === 0) : this.patients;
  }

  addPatient(patient: any) {
    this.indexedDB.addPatient(patient);
    this.localPatients = [];
    this.indexedDB.getAllPatients().then((response: any) => {
      if (response) {
        for (const el of response) {
          this.localPatients.push(el.patient);
        }
      }
    });
  }

  deletePatient(patient: any) {
    this.indexedDB.deletePatient(patient.resource.id);
    this.localPatients = [];
    this.indexedDB.getAllPatients().then((response: any) => {
      if (response) {
        for (const el of response) {
          this.localPatients.push(el.patient);
        }
      }
    });
  }

  addObservations(patient: any) {
    this.observationService.setLocalPatient(patient);
    this.router.navigate(['/meritve', 'vnos']);
  }
}
