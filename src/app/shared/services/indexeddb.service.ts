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

      objectStore.createIndex('observation', 'observation', {unique: false});

      objectStore = evt.currentTarget.result.createObjectStore(
        'observationQueue', {keyPath: 'id', autoIncrement: true});

      objectStore.createIndex('type', 'type', {unique: false});
      objectStore.createIndex('value', 'value', {unique: false});
      objectStore.createIndex('subtype', 'subtype', {unique: false});

      objectStore = evt.currentTarget.result.createObjectStore(
        'users', {keyPath: 'id', autoIncrement: true});

      objectStore.createIndex('name', 'name', {unique: false});
      objectStore.createIndex('surname', 'surname', {unique: false});
      objectStore.createIndex('email', 'email', {unique: true});
      objectStore.createIndex('password', 'password', {unique: false});

    }).then(() => {
      this.storeObservations();
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

  addObservation(observation: any) {
    this.db.add('observations', {
      observation: observation
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

  getObservationRange(start, stop) {
    return new Promise((resolve, reject) => {
      let i = 0;
      const observations: any = [];
      const response: any = [];
      this.db.openCursor('observations', (evt) => {
        const cursor = evt.target.result;
        if (cursor) {
          if (i >= start && i < stop) {
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
    this.observationService.getObservations('patronaza', 0, 100).subscribe(
      response => {
        for (const observation of response.entry) {
          this.addObservation(observation);
        }
      },
      error => {
        console.log('Meritev ni bilo mogoce shraniti, napaka v pridobivanju');
      },
    );
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
