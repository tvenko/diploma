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
      objectStore.createIndex('patientId', 'patientId', {unique: false});
      objectStore.createIndex('observation', 'observation', {unique: false});

      objectStore = evt.currentTarget.result.createObjectStore(
        'observationQueue', {keyPath: 'id', autoIncrement: true});

      objectStore.createIndex('type', 'type', {unique: false});
      objectStore.createIndex('value', 'value', {unique: false});
      objectStore.createIndex('subtype', 'subtype', {unique: false});
      objectStore.createIndex('patient', 'patient', {unique: false});
      objectStore.createIndex('date', 'date', {unique: false});

      objectStore = evt.currentTarget.result.createObjectStore(
        'deleteQueue', {keyPath: 'id', autoIncrement: true});

      objectStore.createIndex('id', 'id', {unique: true});

      objectStore = evt.currentTarget.result.createObjectStore(
        'patients', {keyPath: 'id', autoIncrement: true});

      objectStore.createIndex('id', 'id', {unique: true});
      objectStore.createIndex('patient', 'patient', {unique: false});
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
      patient: patient,
      date: new Date()
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

  // Pridobimo meritve iz vrste za posiljnaje na streznik, glede na id pacienta.
  getObservationFromQueueByPatient(patientId: number) {
    return new Promise((resolve) => {
      const patients = [];
      this.db.openCursor('observationQueue', (evt) => {
        const cursor = evt.target.result;
        if (cursor) {
          if (cursor.value.patient === patientId.toString()) {
            patients.push(cursor.value);
          }
          cursor.continue();
        }
      }, resolve(patients));
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
  addObservation(observation: any, id: number): number {
    this.db.add('observations', {
      observation: observation,
      id: id,
      patientId: observation.resource.subject.reference.split('/')[1]
    }).then((_observation) => {
      console.log('uspesno dodana meritev ' + _observation);
      return 1;
    }, (error) => {
      console.log('napaka pri dodajanju meritve ' + error);
      return 0;
    });
    return 0;
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

  // Pridobimo vse meritve glede na id pacienta.
  getObservationsById(id: string) {
    const observations: any = [];
    return new Promise((resolve) => {
      this.db.openCursor('observations', (evt) => {
        const cursor = evt.target.result;
        if (cursor) {
          if (cursor.value.observation.resource.subject) {
            if (cursor.value.observation.resource.subject.reference === id) {
              observations.push(cursor.value.observation);
            }
          }
          cursor.continue();
        }
      });
      resolve(observations);
    });
  }

  // Izbrisemo meritev s podanim IDjem
  deleteObservtion(id: number) {
    this.db.delete('observations', id).then(() => {
      console.log('uspesno zbrisan');
    }, (error) => {
      console.log('napaka pri brisanj ' + error);
    });
  }

  // Izbrisemo meritev z podanim id uporabnika
  deleteObseravtionByPatient(patientId: number) {
    this.db.getByIndex('observations', 'patientId', patientId.toString()).then((observation) => {
      if (observation) {
        this.deleteObservtion(observation.id);
        this.deleteObseravtionByPatient(patientId);
      }
    }, (error) => console.log(error));
  }

  // Izbrisemo vse meritve v lokalni shrambi.
  deleteAllObservations() {
    this.db.clear('observations').then(() => {
      console.log('uspesno zbrisane vse meritve v IndexedDB');
    }, (error) => {
      console.log('napaka pri brisanju meritev ' + error);
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
    console.log(id);
    this.db.delete('deleteQueue', id.toString()).then(() => {
      console.log('uspesno zbrisan');
    }, (error) => {
      console.log('napaka pri brisanj ' + error);
    });
  }

  /**
   * Metode za shranjevanje in pridobivanje pacientov.
   * Uporabimo, ko je uporabnik offline.
   */

  // Dodamo pacienta v lokalno shrmabo.
  addPatient(patient: any) {
    this.db.add('patients', {
      patient: patient,
      id: patient.resource.id
    }).then((_patient) => {
      console.log('uspesno dodan pacient ' + _patient);
    }, (error) => {
      console.log('napaka pri dodajanju pacienta ' + error);
    });
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

  // Izbrisemo pacienta s podanim id-jem.
  deletePatient(id: number) {
    this.db.delete('patients', id).then(() => {
      console.log('pacient uspesno zbrisan');
    }, (error) => {
      console.log('napaka pri brisanju pacienta ' + error);
    });
  }

  // Izbrisemo vse paciente.
  deleteAllPatients() {
    this.db.clear('patients').then(() => console.log('uspesno zbrisani vsi pacienti'),
      (error) => console.log('napaka pri brisanju pacientov', error))
  }
}
