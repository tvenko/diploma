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

  constructor(private observationService: ObservationService, private indexedDB: IndexedDBService) { }

  ngOnInit() {
    this.observationForm = new FormGroup ({
      'bodyWeight': new FormControl(null, this.weightValidator.bind(this)),
      'heartRate': new FormControl(null, this.heartRateValidator.bind(this)),
      'oxygenSaturation': new FormControl(null, this.oxygenSaturationValidator.bind(this)),
      'bodyTemperature': new FormControl(null, this.temperatureValidator.bind(this)),
      'patient': new FormControl(null, Validators.required),
      'bloodPressure': new FormGroup({
        'systolicPressure': new FormControl(null, this.systolicPressureValidator.bind(this)),
        'diastolicPressure': new FormControl(null, this.diastolicPressureValidator.bind(this))
      })
    }, this.formValidator.bind(this));
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
          // Dodamo meritev v cakalno vrsto
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
  postObservation(): Promise<any> {
    return new Promise((resolve, reject) => {
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
                resolve(response.entry.length);
              } else {
                console.log('napaka pri posiljnaju meritev, niso bile sprejete vse meritve');
                reject();
              }
            }
          );
        } else {
          resolve(0);
        }
      });
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
        this.patient = this.observationService.getLoclaPatient();
        // Za pacienta nastavimo paienta, ki je izbran pri pregledu
        if (this.patient) {
          for (const patient of this.patients) {
            if (this.patient.resource.id === patient.resource.id) {
              this.patient = patient;
              break;
            }
          }
        }
      },
      () => {
        console.log('pacientov ni bilo mogoce pridoviti');
        this.indexedDB.getAllPatients().then((response: any) => {
          if (response) {
            for (const patient of response) {
              this.patients.push(patient.patient);
            }
            this.patient = this.observationService.getLoclaPatient();
            // Za pacienta nastavimo paienta, ki je izbran pri pregledu
            if (this.patient) {
              for (const patient of this.patients) {
                if (this.patient.resource.id === patient.resource.id) {
                  this.patient = patient;
                  break;
                }
              }
            }
          }
        });
      }
    );
  }

  /**
   * Validatorji za razpon vrednosti meritev, ki jih lahko vnesemo.
   */

  weightValidator(control: FormControl): {[s: string]: boolean} {
    if ((control.value < 0 || control.value > 300) && control.value !== null) {
      return {'forbbiden': true};
    }
    return null;
  }

  heartRateValidator(control: FormControl): {[s: string]: boolean} {
    if ((control.value < 30 || control.value > 220) && control.value !== null) {
      console.log('napaka utrip');
      return {'forbbiden': true};
    }
    return null;
  }

  oxygenSaturationValidator(control: FormControl): {[s: string]: boolean} {
    if ((control.value < 80 || control.value > 100) && control.value !== null) {
      return {'forbbiden': true};
    }
    return null;
  }

  temperatureValidator(control: FormControl): {[s: string]: boolean} {
    if ((control.value < 30 || control.value > 47) && control.value !== null) {
      return {'forbbiden': true};
    }
    return null;
  }

  systolicPressureValidator(control: FormControl): {[s: string]: boolean} {
    if ((control.value < 70 || control.value > 280) && control.value !== null) {
      return {'forbbiden': true};
    }
    return null;
  }

  diastolicPressureValidator(control: FormControl): {[s: string]: boolean} {
    if ((control.value < 40 || control.value > 160) && control.value !== null) {
      return {'forbbiden': true};
    }
    return null;
  }

  /**
   * validator za celotno formo, ki preverja ali ima vsaj eno polje vrednost.
   * @param group
   * @returns {{forrbiden: boolean}}
   */

  formValidator(group: FormGroup): {[s: string]: boolean} {
    let isAtLestOne = false;
    for (const control in group.controls) {
      if (group.controls[control].value !== null && control !== 'patient') {
        if (control === 'bloodPressure') {
          const bloodPressure: any = group.controls[control];
          for (const cont in bloodPressure.controls) {
            if (bloodPressure.controls[cont].value !== null) {
              isAtLestOne = true;
            }
          }
        } else {
          isAtLestOne = true;
        }
      }
    }
    return isAtLestOne ? null : {'forrbiden': true};
  }
}
