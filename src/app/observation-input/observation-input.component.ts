import { Component, OnInit } from '@angular/core';
import { ObservationService } from '../shared/services/observation.service';
import { Observation } from '../shared/templates/Observation';
import {FormControl, FormGroup, Validators} from '@angular/forms';

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

  constructor(private observationService: ObservationService) { }

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

  postObservation() {
    let observation: Observation;

    this.bundle.resourceType = 'Bundle';
    this.bundle.type = 'transaction';
    this.bundle.id = 'patronaza-sluzba';
    this.bundle.entry = [];

    this.request.method = 'POST';
    this.entry.request = this.request;

    Object.keys(this.observationForm.controls).forEach(key => {
      if (this.observationForm.get(key).value !== null) {
        const entry: any = {};
        entry.request = this.request;
        observation = new Observation();
        entry.resource = (observation.createObservable(+this.observationForm.get(key).value, key, this.observationForm.get(key)));;
        if (entry.resource !== null) {
          this.bundle.entry.push(entry);
        }
      }
    });

    this.observationService.post(this.bundle).subscribe(
      response => console.log(response)
    );
  }
}
