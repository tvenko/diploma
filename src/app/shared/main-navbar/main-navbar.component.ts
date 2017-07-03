import { Component } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-main-navbar',
  templateUrl: './main-navbar.component.html',
  styleUrls: ['./main-navbar.component.css']
})
export class MainNavbarComponent {

  constructor(private userService: UserService) { }

  onLogOut() {
    this.userService.logout();
  }
}
