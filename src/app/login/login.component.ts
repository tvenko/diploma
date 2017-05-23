import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../shared/services/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  user: {name: string, surname: string, email: string, password: string};
  loginFail = false;

  constructor(private formBuilder: FormBuilder, private userService: UserService, private router: Router) { }

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
        this.router.navigate(['meritve', 'vnos']);
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
