import { Component, OnInit } from '@angular/core';
import { IndexedDBService } from './shared/services/indexeddb.service';
import * as firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private indexedDB: IndexedDBService) {}

  ngOnInit() {
    // inicializacija IndexedDB baze v brskalniku.
    this.indexedDB.initializeDB();
    firebase.initializeApp({
      apiKey: 'AIzaSyC2Ir8fsNW81YXZvBaC8AuXjr9yEwnPzoc',
      authDomain: 'diploma-ded11.firebaseapp.com',
    });
  }
}
