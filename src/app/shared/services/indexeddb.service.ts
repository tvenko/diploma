import { AngularIndexedDB } from 'angular2-indexeddb';

export class IndexedDBService {

  db: any;
  DB_VERSION = 1;
  user: {name: string, surname: string, email: string, password: string, id: number};

  initializeDB() {
    this.db = new AngularIndexedDB('myDb', this.DB_VERSION);
    this.db.createStore(this.DB_VERSION, (evt) => {

      let objectStore = evt.currentTarget.result.createObjectStore(
        'observationQueue', {keyPath: 'id', autoIncrement: true});

      objectStore.createIndex('type', 'type', {unique: false});
      objectStore.createIndex('value', 'value', {unique: false});

      objectStore = evt.currentTarget.result.createObjectStore(
        'users', {keyPath: 'id', autoIncrement: true});

      objectStore.createIndex('name', 'name', {unique: false});
      objectStore.createIndex('surname', 'surname', {unique: false});
      objectStore.createIndex('email', 'email', {unique: true});
      objectStore.createIndex('password', 'password', {unique: false});

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

  addObservationToQueue(type: string, value: number) {
    this.db.add('observationQueue', {
      type: type,
      value: value
    }).then((observation) => {
      console.log('uspesno dodana meritev ' + observation);
    }, (error) => {
      console.log('napaka pri dodajanju meritve ' + error);
    });
  }

  getAllObservations() {
    return new Promise<any>((resolve, reject) => {
      this.db.getAll('observationQueue').then((observations) => {
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

  deleteAllObservations() {
    return new Promise<any>((resolve, reject) => {
      this.db.clear('observationQueue').then(() => {
        resolve();
      }, (error) => {
        console.log('napaka pri brisanju meritev ' + error);
        reject();
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
