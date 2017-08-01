import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Router } from '@angular/router';
import { IndexedDBService } from './indexeddb.service';

@Injectable()
export class UserService {

  token: string;
  offline: boolean;

  constructor (private router: Router, private indexedDB: IndexedDBService) {}

  /**
   * Funkcija, ki registrira novega uporabnika ne FireBase strezniku.
   * @param email
   * @param password
   * @param name
   */
  signUpUser(email: string, password: string, name: string) {
    firebase.auth().createUserWithEmailAndPassword(email, password).then((user) => {
      firebase.auth().currentUser.updateProfile({displayName: name, photoURL: password});
    })
      .catch(error => console.log('napak pri registraciji na firebase ', error));
  }

  /**
   * Funkcija, ki poskusa prijaviti uporabnika in pridobiti tolken preko FireBase streznika, ce to ne uspe preveri
   * legitimnost uporabnika s pomocjo lokalne shrambe.
   * @param email
   * @param password
   * @returns {Promise<any>}
   */
  signInUser(email: string, password: string) {
    this.offline = false;
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(email, password)
      // Prijava s FireBase je uspela, uporabnika si shranimo v lokalno shrambo.
        .then((user) => {
          this.token = user.token;
          this.router.navigate(['meritve']);
          if (user.displayName) {
            const name = user.displayName.split(' ');
            this.indexedDB.addUser(name[0], name[1], user.email, user.photoURL);
          }
        })
        // Prijava s FireBase ni uspela, email in password preverimo s podatki, ki jih imamo shranjene v lokalni shrambi.
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

  /**
   * Funkcija za odjavo uporabnika.
   */
  logout() {
    firebase.auth().signOut();
    this.token = null;
    this.router.navigate(['/']);
  }

  /**
   * Funkcija s katero preverimo ali je uporabnik avtenticiran, uporabljamo za auth guard.
   * @returns {Promise<boolean>}
   */
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
