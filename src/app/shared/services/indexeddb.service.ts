import { ObservationService } from './observation.service';
import { Injectable } from '@angular/core';
import { AngularIndexedDB } from './AngularIndexedDB';

@Injectable()
export class IndexedDBService {

  db: any;
  DB_VERSION = 1;
  user: {name: string, surname: string, email: string, password: string, id: number};

  constructor (private observationService: ObservationService) {}

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

  addObservationToQueue(type: string, value: number, subtype: any = null) {
    this.db.add('observationQueue', {
      type: type,
      value: value,
      subtype: subtype
    }).then((observation) => {
      console.log('uspesno dodana meritev v vrsto ' + observation);
    }, (error) => {
      console.log('napaka pri dodajanju meritve v vrsto ' + error);
    });
  }

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

  getObservationRange(start: number, stop: number, patinetId: string) {
    return new Promise((resolve, reject) => {
      let i = 0;
      const observations: any = [];
      const response: any = [];
      this.db.openCursor('observations', (evt) => {
        const cursor = evt.target.result;
        if (cursor) {
          if (i >= start && i < stop && cursor.value.observation.resource.subject.reference === patinetId) {
            observations.push(cursor.value.observation);
          }
          i++;
          cursor.continue();
        } else {
          response[0] = i;
        }
      });
      response[1] = observations;
      resolve(response);
    });
  }

  storeObservations() {
    this.observationService.getObservations('patronaza1', 0, 100).subscribe(
      response => {
        if (response.entry) {
          for (const observation of response.entry) {
            this.addObservation(observation, observation.resource.id);
          }
        }
      },
      error => {
        console.log('Meritev ni bilo mogoce shraniti, napaka v pridobivanju');
      },
    );
  }

  deleteObservtion(id: number) {
    this.db.delete('observations', id).then(() => {
      console.log('uspesno zbrisan');
    }, (error) => {
      console.log('napaka pri brisanj ' + error);
    });
  }

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

  setUser(user: any) {
    this.user = user;
  }

  unsetUser() {
    this.user = null;
  }

  getUser() {
    return this.user;
  }
}
