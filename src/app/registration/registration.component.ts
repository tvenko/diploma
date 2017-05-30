import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IndexedDBService } from '../shared/services/indexeddb.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  registrationForm: FormGroup;

  constructor(private router: Router, private indexedDB: IndexedDBService) { }

  ngOnInit() {
    this.registrationForm = new FormGroup ({
      'name': new FormControl(null, Validators.required),
      'surname': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, Validators.required),
      'password1': new FormControl(null, [Validators.required, this.matchPassword.bind(this)])
    });
  }

  onRegister() {
    this.indexedDB.addUser(this.registrationForm.controls.name.value, this.registrationForm.controls.surname.value,
      this.registrationForm.controls.email.value, this.registrationForm.controls.password.value);
    this.router.navigate(['/prijava']);
  }

  matchPassword(control: FormControl): {[s: string]: boolean} {
    if (this.registrationForm) {
      if (control.value !== this.registrationForm.controls.password.value) {
        return {'Passwords doesnt match': true};
      }
    }
    return null;
  }
}
