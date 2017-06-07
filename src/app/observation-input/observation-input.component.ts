import { Component, OnInit } from '@angular/core';
import { ObservationService } from '../shared/services/observation.service';
import { Observation } from '../shared/templates/Observation';
import { FormControl, FormGroup } from '@angular/forms';
import { IndexedDBService } from '../shared/services/indexeddb.service';

@Component({
  selector: 'app-observation-input',
  templateUrl: './observation-input.component.html',
  styleUrls: ['./observation-input.component.css'],
  providers: [Observation]
})
export class ObservationInputComponent implements OnInit {

  request: any = {};
  entry: any = {};
  bundle: any = {};
  observationForm: FormGroup;

  constructor(private observationService: ObservationService, private indexedDB: IndexedDBService) { }

  ngOnInit() {

    this.observationForm = new FormGroup ({
      'bodyWeight': new FormControl(null),
      'heartRate': new FormControl(null),
      'oxygenSaturation': new FormControl(null),
      'bodyTemperature': new FormControl(null),
      'bloodPressure': new FormGroup({
        'systolicPressure': new FormControl(null),
        'diastolicPressure': new FormControl(null)
      })
    });

  }

  saveToQueue() {
    Object.keys(this.observationForm.controls).forEach(key => {
      if (this.observationForm.get(key).value !== null) {
        if (key === 'bloodPressure') {
          const obs: any = this.observationForm.get(key);
          if (obs.get('diastolicPressure').value) {
            this.indexedDB.addObservationToQueue('diastolicPressure', obs.get('diastolicPressure').value);
          }
          if (obs.get('systolicPressure').value) {
            this.indexedDB.addObservationToQueue('systolicPressure', obs.get('systolicPressure').value);
          }
        } else {
          this.indexedDB.addObservationToQueue(key, +this.observationForm.get(key).value);
        }
      }
    });
    this.postObservation();
  }

  postObservation() {
    let observation: Observation;

    this.bundle.resourceType = 'Bundle';
    this.bundle.type = 'transaction';
    this.bundle.id = 'patronaza-sluzba';
    this.bundle.entry = [];

    this.request.method = 'POST';
    this.entry.request = this.request;

    this.indexedDB.getAllObservations().then((observations) => {
      if (observations.length > 0) {
        for (const el of observations) {
          const entry: any = {};
          entry.request = this.request;
          observation = new Observation();
          entry.resource = (observation.createObservable(el.value, el.type, this.observationForm.get(el.type)));
          if (entry.resource !== null) {
            this.bundle.entry.push(entry);
          }
        }
        this.observationService.post(this.bundle).subscribe(
          response => {
            console.log(response);
            if (response.entry.length === observations.length) {
              this.indexedDB.deleteAllObservations();
            } else {
              console.log('napaka pri posiljnaju meritev, niso bile sprejete vse meritve');
            }
          }
        );
      }
    });
  }
}
