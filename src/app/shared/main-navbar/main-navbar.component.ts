import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-navbar',
  templateUrl: './main-navbar.component.html',
  styleUrls: ['./main-navbar.component.css']
})
export class MainNavbarComponent {

  constructor(private router: Router) { }

  onLogOut() {
    this.router.navigate(['/prijava']);
  }
}
