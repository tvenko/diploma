import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { ObiskiService } from './shared/services/obiski.service';
import { LoginComponent } from './login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@angular/material';
import { AppRoutingModule } from './app-routing.module';
import { RegistrationComponent } from './registration/registration.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UserService } from './shared/services/users.service';
import { ObservationInputComponent } from './observation-input/observation-input.component';
import { ObservationListComponent } from './observation-list/observation-list.component';
import { ObservationService } from './shared/services/observation.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrationComponent,
    ObservationInputComponent,
    ObservationListComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    MaterialModule,
    FlexLayoutModule,
    AppRoutingModule,
    RouterModule,
    ReactiveFormsModule
  ],
  providers: [ObiskiService, UserService, ObservationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
