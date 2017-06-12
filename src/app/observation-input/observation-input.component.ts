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
          if (add) {
            this.indexedDB.addObservationToQueue('bloodPressure', 0, subtype);
          }
        } else {
          this.indexedDB.addObservationToQueue(key, +this.observationForm.get(key).value);
        }
      }
    });
    this.postObservation();
    this.observationForm.reset();
  }

  postObservation() {
    let observation: Observation;

    this.bundle.resourceType = 'Bundle';
    this.bundle.type = 'transaction';
    this.bundle.id = 'patronaza-sluzba';
    this.bundle.entry = [];

    this.request.method = 'POST';
    this.entry.request = this.request;

    this.indexedDB.getAllObservationsQueue().then((observations) => {
      console.log('check ' + observations);
      if (observations.length > 0) {
        for (const el of observations) {
          const entry: any = {};
          entry.request = this.request;
          observation = new Observation();
          entry.resource = (observation.createObservable(el.value, el.type, el.subtype));
          if (entry.resource !== null) {
            this.bundle.entry.push(entry);
          }
        }
        this.observationService.post(this.bundle).subscribe(
          response => {
            console.log(response);
            if (response.entry.length === observations.length) {
              this.indexedDB.deleteAllObservationsQueue();
            } else {
              console.log('napaka pri posiljnaju meritev, niso bile sprejete vse meritve');
            }
          }
        );
      }
    });
  }
}
