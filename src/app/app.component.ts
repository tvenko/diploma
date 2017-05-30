import { Component, OnInit } from '@angular/core';
import { IndexedDBService } from './shared/services/indexeddb.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private indexedDB: IndexedDBService) {}

  ngOnInit() {
    this.indexedDB.initializeDB();
  }
}
