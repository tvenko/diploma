import { ObservationService } from './observation.service';
import { Injectable } from '@angular/core';
import { AngularIndexedDB } from './AngularIndexedDB';

@Injectable()
export class IndexedDBService {

  db: any;
  DB_VERSION = 1;

  constructor (private observationService: ObservationService) {}

  /**
   *  Inicializacija IndexedDB lokalne podatkovne baze.
   */

  initializeDB() {
    this.db = new AngularIndexedDB();
    this.db.createStore(this.DB_VERSION, (evt) => {

      let objectStore = evt.currentTarget.result.createObjectStore(
        'observations', {keyPath: 'id', autoIncrement: true});

      objectStore.createIndex('id', 'id', {unique: true});
      objectStore.createIndex('observation', 'observation', {unique: false});

      objectStore = evt.currentTarget.result.createObjectStore(
        'observationQueue', {keyPath: 'id', autoIncrement: true});

      objectStore.createIndex('type', 'type', {unique: false});
      objectStore.createIndex('value', 'value', {unique: false});
      objectStore.createIndex('subtype', 'subtype', {unique: false});
      objectStore.createIndex('patient', 'patient', {unique: false});

      objectStore = evt.currentTarget.result.createObjectStore(
        'deleteQueue', {keyPath: 'id', autoIncrement: true});

      objectStore.createIndex('id', 'id', {unique: true});

      objectStore = evt.currentTarget.result.createObjectStore(
        'patients', {keyPath: 'id', autoIncrement: true});

      objectStore.createIndex('id', 'id', {unique: true});
      objectStore.createIndex('patient', 'patient', {unique: false});

      objectStore = evt.currentTarget.result.createObjectStore(
        'users', {keyPath: 'id', autoIncrement: true});

      objectStore.createIndex('name', 'name', {unique: false});
      objectStore.createIndex('surname', 'surname', {unique: false});
      objectStore.createIndex('email', 'email', {unique: true});
      objectStore.createIndex('password', 'password', {unique: false});

    }).then(() => {
      this.storeObservations();
      this.storePatients();
    });
  }

  /**
   * Metode za dodajanje in pridobivanje uporabnikov (patronazne sestre).
   */

  // Ob registraciji dodamo uporabnika v indexedDB
  addUser(name: string, surname: string, email: string, password: string) {
    this.db.add('users', {
      name: name,
      surname: surname,
      email: email,
      password: password }).then((user) => {
        console.log('registracija uspesna ' + user);
      }, (error) => {
        console.log('napaka pri registraciji: ' + error);
      }
    );
  }

  // pridobimo uporabnika iz IndexedDB glede na email
  getByEmail(email: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.db.getByIndex('users', 'email', email).then((user) => {
        if (user) {
          resolve(user);
        } else {
          reject();
        }
      }, (error) => {
        console.log('uporabnik s ' + email + ' ne obstaja.' + error);
        reject();
      });
    });
  }

  /**
   * Metode za dodajanje, pridobivanje in brisanje meritev v cakalno vrsto.
   */

  // Dodamo novo meritev v cakalno vrsto
  addObservationToQueue(type: string, value: number, patient: number, subtype: any = null) {
    this.db.add('observationQueue', {
      type: type,
      value: value,
      subtype: subtype,
      patient: patient
    }).then((observation) => {
      console.log('uspesno dodana meritev v vrsto ' + observation);
    }, (error) => {
      console.log('napaka pri dodajanju meritve v vrsto ' + error);
    });
  }

  // Pridobimo vse meritve, ki so shranjene v vrsti
  getAllObservationsQueue() {
    return new Promise<any>((resolve, reject) => {
      this.db.getAll('observationQueue').then((observations) => {
        if (observations) {
          resolve(observations);
        } else {
          reject();
        }
      }, (error) => {
        console.log('napaka pri pridobivanju meritev iz vrste ' + error);
        reject();
      });
    });
  }

  // Izbrisemo vse meritve v vrsti
  deleteAllObservationsQueue() {
    return new Promise<any>((resolve, reject) => {
      this.db.clear('observationQueue').then(() => {
        resolve();
      }, (error) => {
        console.log('napaka pri brisanju meritev v vrsti' + error);
        reject();
      });
    });
  }

  /**
   * Metode za dodajanje, pridobivanje in brisanje meritev, ki jih pridobimo iz streznika in shranimo.
   * Uporabniku jih vrnemo, ko je offline.
   */

  // dodamo meritev v indexedDB, da jo lahk ovrnemo uporabniku, ko je offline
  addObservation(observation: any, id: number) {
    this.db.add('observations', {
      observation: observation,
      id: id
    }).then((_observation) => {
      console.log('uspesno dodana meritev ' + _observation);
    }, (error) => {
      console.log('napaka pri dodajanju meritve ' + error);
    });
  }

  // Pridobimo vse meritve, ki jih imamo shranjene
  getAllObservations() {
    return new Promise<any>((resolve, reject) => {
      this.db.getAll('observations').then((observations) => {
        if (observations) {
          resolve(observations);
        } else {
          reject();
        }
      }, (error) => {
        console.log('napaka pri pridobivanju meritev ' + error);
        reject();
      });
    });
  }

  // Pridobim meritve iz intervala podanega s start in stop, ki ustrezajo pacientu s IDjem enakim patientId
  getObservationRange(start: number, stop: number, patinetId: string) {
    return new Promise((resolve) => {
      let i = 0;
      const observations: any = [];
      const response: any = [];
      this.db.openCursor('observations', (evt) => {
        const cursor = evt.target.result;
        if (cursor) {
          // Preverimo ali je meritev sploh veljavna
          // Neveljavna je lahko, ce zbrisemo meritev, vendar se na strezniku se ne pobrise popolno ampak samo ni ma vrednosti
          if (cursor.value.observation.resource.subject) {
            if (i >= start && i < stop && cursor.value.observation.resource.subject.reference === patinetId) {
              observations.push(cursor.value.observation);
            }
            i++;
          } else {
            // ce obstaja neveljavna meritev v IndexedDB jo pobrisemo
            this.deleteObservtion(cursor.value.id);
          }
          cursor.continue();
        } else {
          response[0] = i;
        }
      });
      response[1] = observations;
      resolve(response);
    });
  }

  // Shranimo prvih 100 meritev v indexedDB, klice se ob inicializaciji baze in sinhronizaciji
  storeObservations() {
    this.observationService.getObservations('patronaza1', 0, 100).subscribe(
      response => {
        if (response.entry) {
          for (const observation of response.entry) {
            this.addObservation(observation, observation.resource.id);
          }
        }
      },
      () => {
        console.log('Meritev ni bilo mogoce shraniti, napaka v pridobivanju');
      },
    );
  }

  // Izbrisemo meritev s podanim IDjem
  deleteObservtion(id: number) {
    this.db.delete('observations', id).then(() => {
      console.log('uspesno zbrisan');
    }, (error) => {
      console.log('napaka pri brisanj ' + error);
    });
  }

  /**
   * Metode za dodajanje, pridobvanje in brisanje meritev v vrsti za brisanje
   */

  // id meritve dodamo v vrsto za brisanje
  addToDeleteQueue(id: number) {
    return new Promise((resolve, reject) => {
      this.db.add('deleteQueue', {
        id: id
      }).then(() => {
        console.log('meritev uspesno dodana v vrsto za brisanje');
        resolve();
      }, (error) => {
        console.log('napaka pri dodajanju meritve v vrsto za brisanje ' + error);
        reject();
      });
    });
  }

  // Pridobimo vse IDje meritev, ki so v vrsti za brisanje
  getAllObservationsDeleteQueue() {
    return new Promise((resolve, reject) => {
      this.db.getAll('deleteQueue').then((observations) => {
        if (observations) {
          resolve(observations);
        } else {
          reject();
        }
      }, (error) => {
        console.log('napaka pri pridobivanju meritev iz vrste za brisanje ' + error);
        reject();
      });
    });
  }

  // Izbrisemo ID meritve, ki smo jo uspesno zbrisali tudi na strezniku
  deleteObservationDeleteQueue(id: number) {
    this.db.delete('deleteQueue', id).then(() => {
      console.log('uspesno zbrisan');
    }, (error) => {
      console.log('napaka pri brisanj ' + error);
    });
  }

  /**
   * Metode za shranjevanje in pridobivanje pacientov.
   * Uporabimo, ko je uporabnik offline.
   */

  // V IndexedDB si shranimo vse paciente, ki jih imamo na strezniku, metoda se klice ob inicializaciji baze
  storePatients() {
    this.observationService.getPatients('patronaza1').subscribe(
      response => {
        if (response.entry) {
          for (const patient of response.entry) {
            this.db.add('patients', {
              patient: patient,
              id: patient.resource.id
            }).then((_patient) => {
              console.log('uspesno dodan pacient ' + _patient);
            }, (error) => {
              console.log('napaka pri dodajanju pacienta ' + error);
            });
          }
        }
      },
      error => {
        console.log('ni bilo mogoce shraniti pacientov lokalno shrambo ' + error);
    }
    );
  }

  // Pridobimo vse shranjene paciente
  getAllPatients() {
    return new Promise((resolve, reject) => {
      this.db.getAll('patients').then((patients) => {
        if (patients) {
          resolve(patients);
        } else {
          console.log('pacientov ni bilo mogoce pridobiti iz IndexedDB');
          reject();
        }
      });
    });
  }

  // Pridobimo pacienta s podanim IDjem
  getPatient(id: number) {
    return new Promise((resolve, reject) => {
      this.db.getByIndex('patients', 'id', id).then((patient) => {
        if (patient) {
          resolve(patient.patient.resource);
        } else {
          console.log('napaka pri pridobivanju pacienta');
          reject();
        }
      }, (error) => {
        console.log('napaka pri pridobivanju pacienta ' + error);
      });
    });
  }
}
