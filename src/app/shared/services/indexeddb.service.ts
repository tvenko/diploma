import { AngularIndexedDB } from 'angular2-indexeddb';

export class IndexedDBService {

  db: any;
  DB_VERSION = 1;
  user: {name: string, surname: string, email: string, password: string, id: number};

  initializeDB() {
    this.db = new AngularIndexedDB('myDb', this.DB_VERSION);
    this.db.createStore(this.DB_VERSION, (evt) => {
      const objectStore = evt.currentTarget.result.createObjectStore(
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
