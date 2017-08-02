import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IndexedDBService } from '../shared/services/indexeddb.service';
import { UserService } from '../shared/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  user: {name: string, surname: string, email: string, password: string, id: number};
  loginFail = false;

  constructor (private router: Router, private indexedDB: IndexedDBService, private userService: UserService) {}

  ngOnInit() {
    if (!navigator.onLine) {
      this.router.navigate(['/priprava']);
    }
    this.loginForm = new FormGroup({
      'email': new FormControl(null, [Validators.email, Validators.required]),
      'password': new FormControl(null, Validators.required)
    });
  }

  onLogin() {
    this.userService.signInUser(this.loginForm.controls.email.value, this.loginForm.controls.password.value)
      .catch(() => {
        this.loginFail = true;
        this.loginForm.controls.password.reset();
      }
    );
  }
}
