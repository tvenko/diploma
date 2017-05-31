import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IndexedDBService } from '../services/indexeddb.service';

@Component({
  selector: 'app-main-navbar',
  templateUrl: './main-navbar.component.html',
  styleUrls: ['./main-navbar.component.css']
})
export class MainNavbarComponent {

  constructor(private router: Router, private indexedDB: IndexedDBService) { }

  onLogOut() {
    this.indexedDB.unsetUser();
    this.router.navigate(['/prijava']);
  }
}
