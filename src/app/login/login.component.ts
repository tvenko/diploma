import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import { UserService } from '../shared/services/users.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  user: {name: string, surname: string, email: string, password: string};
  loginFail = false;

  constructor(private formBuilder: FormBuilder, private userService: UserService) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      'email': new FormControl(null, [Validators.email, Validators.required]),
      'password': new FormControl(null, Validators.required)
    });
  }

  onLogin() {
    this.user = this.userService.getUserByEmail(this.loginForm.controls.email.value);
    if (this.user) {
      if (this.user.password === this.loginForm.controls.password.value) {
        console.log('uspesna prijava');
      } else {
        this.loginFail = true;
        this.loginForm.controls.password.reset();
      }
    } else {
      this.loginFail = true;
      this.loginForm.controls.password.reset();
    }
  }
}
