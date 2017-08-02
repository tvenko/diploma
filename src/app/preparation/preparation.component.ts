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
  online: boolean;

  patients = [];
  patient: any;
  localPatients = [];

  constructor(private observationService: ObservationService,
              private indexedDB: IndexedDBService,
              private router: Router) {
    // potrebno za autocomplete
    this.patientCtrl = new FormControl();
    this.filteredPatients = this.patientCtrl.valueChanges
      .startWith(null)
      .map(name => this.filterPatients(name));
  }

  ngOnInit() {
    this.online = navigator.onLine;
    // napolnimo tabelo vseh pacientov
    this.observationService.getPatients('patronaza1').subscribe(
      response => {
        for (const el of response.entry) {
          this.patients.push(el);
        }
      }, error => console.log(error)
    );
    // napolnimo tabelo lokalno shranjenih uporabnikov
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

  filterPatients(val: string) {
    console.log(this.patients.filter(s => console.log(s)));
    return val ? this.patients.filter(s => s.resource.name[0].family.toLowerCase().indexOf(val.toLowerCase()) === 0 ||
    s.resource.name[0].given[0].toLowerCase().indexOf(val.toLowerCase()) === 0) : this.patients;
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
    this.getObservationByCode(+patient.resource.id, '3141-9'); // body weight;
    this.getObservationByCode(+patient.resource.id, '8867-4');  // heart rate
    this.getObservationByCode(+patient.resource.id, '59408-5');  // oxygen saturation
    this.getObservationByCode(+patient.resource.id, '55284-4');  // blood pressure
    this.getObservationByCode(+patient.resource.id, '8310-5');  // body temperature
  }

  getObservationByCode(id: number, code: string) {
    this.observationService.getObservationByPatientAndCode('patronaza1', 1, id, code).subscribe(
      response => {
        if (response.entry) {
          this.indexedDB.addObservation(response.entry[0], response.entry[0].resource.id)
        }
      }
    );
  }

  deletePatient(patient: any) {
    this.indexedDB.deletePatient(patient.resource.id);
    this.indexedDB.deleteObseravtionByPatient(+patient.resource.id);
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
