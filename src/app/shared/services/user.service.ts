import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Router } from '@angular/router';
import { IndexedDBService } from './indexeddb.service';

@Injectable()
export class UserService {

  constructor (private router: Router, private indexedDB: IndexedDBService) {}

  /**
   * Funkcija, ki registrira novega uporabnika ne FireBase strezniku.
   * @param email
   * @param password
   * @param name
   */
  signUpUser(email: string, password: string, name: string) {
    firebase.auth().createUserWithEmailAndPassword(email, password).then((user) => {
      firebase.auth().currentUser.updateProfile({displayName: name, photoURL: null});
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
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(email, password)
      // Prijava s FireBase je uspela.
        .then((user) => {
          this.router.navigate(['meritve']);
        })
        // Prijava s FireBase ni uspela.
        .catch(error => {
          console.log('napaka pri prijavi ', error);
          reject();
        });
    });
  }

  /**
   * Funkcija za odjavo uporabnika.
   */
  logout() {
    firebase.auth().signOut();
    this.router.navigate(['/']);
  }

  /**
   * Funkcija s katero preverimo ali je uporabnik avtenticiran, uporabljamo za auth guard.
   * @returns {Promise<boolean>}
   */
  isAuthenticated() {
    return new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          resolve(true);
        } else {
          reject();
        }
      })
    });
  }
}
