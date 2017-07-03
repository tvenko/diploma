import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Router } from '@angular/router';
import { IndexedDBService } from './indexeddb.service';

@Injectable()
export class UserService {

  token: string;
  offline: boolean;

  constructor (private router: Router, private indexedDB: IndexedDBService) {}

  signUpUser(email: string, password: string, name: string) {
    firebase.auth().createUserWithEmailAndPassword(email, password).then((user) => {
      firebase.auth().currentUser.updateProfile({displayName: name, photoURL: password});
    })
      .catch(error => console.log('napak pri registraciji na firebase ', error));
  }

  signInUser(email: string, password: string) {
    this.offline = false;
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then((user) => {
          this.token = user.token;
          this.router.navigate(['meritve']);
          const name = user.displayName.split(' ');
          this.indexedDB.addUser(name[0], name[1], user.email, user.photoURL);
        })
        .catch(error => {
          console.log('napaka pri prijavi na firebase ', error);
          this.indexedDB.getByEmail(email).then((user) => {
            if (user.password === password) {
              this.offline = true;
              this.token = 'offline';
              this.router.navigate(['meritve']);
            } else {
              reject();
            }
          }).catch(() => reject())
        });
    });
  }

  logout() {
    firebase.auth().signOut();
    this.token = null;
    this.router.navigate(['/']);
  }

  isAuthenticated() {
    return new Promise((resolve) => {
      if (this.offline) {
        resolve(this.token !== null);
      } else {
        firebase.auth().currentUser.getIdToken().then(token => {
          this.token = token;
          resolve(token !== null);
        }).catch(() => console.log('Napaka pridobivanja tokena '));
      }
    });
  }
}
