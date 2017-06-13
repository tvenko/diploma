import {Component, Injectable, OnInit} from '@angular/core';
import { ObservationService } from '../shared/services/observation.service';
import { Observation } from '../shared/templates/Observation';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IndexedDBService } from '../shared/services/indexeddb.service';

@Component({
  selector: 'app-observation-input',
  templateUrl: './observation-input.component.html',
  styleUrls: ['./observation-input.component.css'],
  providers: [Observation]
})

@Injectable()
export class ObservationInputComponent implements OnInit {

  patients: any[] = [];
  patient: any;
  request: any = {};
  entry: any = {};
  bundle: any = {};
  observationForm: FormGroup;

  observationsAmount = 0;

  constructor(private observationService: ObservationService, private indexedDB: IndexedDBService) { }

  ngOnInit() {

    this.observationForm = new FormGroup ({
      'bodyWeight': new FormControl(null),
      'heartRate': new FormControl(null),
      'oxygenSaturation': new FormControl(null),
      'bodyTemperature': new FormControl(null),
      'patient': new FormControl(null, Validators.required),
      'bloodPressure': new FormGroup({
        'systolicPressure': new FormControl(null),
        'diastolicPressure': new FormControl(null)
      })
    });

    this.getPatients();
  }

  /**
   * Metoda ki shrani meritve, ki jih zelimo poslati v vrsto
   */
  saveToQueue() {
    Object.keys(this.observationForm.controls).forEach(key => {
      if (this.observationForm.get(key).value !== null && key !== 'patient') {
        const patientId = this.patient.resource.id;
        // krvni tlak je potrebno obravnavati posebej, saj je struktura meritve drugacna (vsebuje sistolicni in diastolicni) tlak
        if (key === 'bloodPressure') {
          const obs: any = this.observationForm.get(key);
          const subtype = [];
          let add = false;
          if (obs.get('diastolicPressure').value) {
            add = true;
            const obj: any = {};
            obj.type = 'diastolicPressure';
            obj.value = obs.get('diastolicPressure').value;
            subtype.push(obj);
          }
          if (obs.get('systolicPressure').value) {
            add = true;
            const obj: any = {};
            obj.type = 'systolicPressure';
            obj.value = obs.get('systolicPressure').value;
            subtype.push(obj);
          }
          // preverimo ali je bila katera od vrednosti tlaka dodana, saj je bloodPressure vedno veljaven key
          if (add) {
            this.indexedDB.addObservationToQueue('bloodPressure', 0, patientId, subtype);
          }
        } else {
          // Dodamo meritev vcakalno vrsto
          this.indexedDB.addObservationToQueue(key, +this.observationForm.get(key).value, patientId);
        }
      }
    });
    this.postObservation();
    this.observationForm.reset();
  }

  /**
   * Metoda, ki oblikuje objekt meritve in ga poskusa poslati na streznik
   */
  postObservation() {

    let observation: Observation;

    this.bundle.resourceType = 'Bundle';
    this.bundle.type = 'transaction';
    this.bundle.id = 'patronaza-sluzba';
    this.bundle.entry = [];

    this.request.method = 'POST';
    this.entry.request = this.request;

    this.indexedDB.getAllObservationsQueue().then((observations) => {
      if (observations.length > 0) {
        for (const el of observations) {
          const entry: any = {};
          entry.request = this.request;
          observation = new Observation();
          if (el.patient) {
            // zgeneriramo objekt meritve
            entry.resource = (observation.createObservable(el.value, el.type, el.subtype, el.patient));
          } else {
            console.log('meritvi manjka pacient');
          }
          if (entry.resource !== null) {
            this.bundle.entry.push(entry);
          }
        }
        // Meritve poskusimo poslati na streznik, ce uspe meritve pobrisemo iz vrste
        this.observationService.post(this.bundle).subscribe(
          response => {
            if (response.entry.length === observations.length) {
              this.indexedDB.deleteAllObservationsQueue().then();
               this.observationsAmount = response.entry.length;
            } else {
              console.log('napaka pri posiljnaju meritev, niso bile sprejete vse meritve');
            }
          }
        );
      }
    });
  }

  /**
   * Metoda, ki poskusa pridobiti vse paciente, ki jih imamo s streznika, ce to ne uspe jih poskusi pridobiti iz
   * lokalne shrambe
   */
  getPatients() {
    this.observationService.getPatients('patronaza1').subscribe(
      response => {
        this.patients = response.entry;
      },
      () => {
        console.log('pacientov ni bilo mogoce pridoviti');
        this.indexedDB.getAllPatients().then((response: any) => {
          if (response) {
            for (const patient of response) {
              this.patients.push(patient.patient);
            }
          }
        });
      }
    );
  }
}
