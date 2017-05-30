import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IndexedDBService } from '../shared/services/indexeddb.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  user: {name: string, surname: string, email: string, password: string, id: number};
  loginFail = false;

  constructor (private router: Router, private indexedDB: IndexedDBService) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      'email': new FormControl(null, [Validators.email, Validators.required]),
      'password': new FormControl(null, Validators.required)
    });
  }

  onLogin() {
    this.indexedDB.getByEmail(this.loginForm.controls.email.value).then((user) => {
      this.user = user;
      if (this.user.password === this.loginForm.controls.password.value) {
        this.router.navigate(['meritve', 'vnos']);
      } else {
        this.loginFail = true;
        this.loginForm.controls.password.reset();
      }
    }, () => {
      this.loginFail = true;
      this.loginForm.controls.password.reset();
    });
  }
}
