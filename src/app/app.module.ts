import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@angular/material';
import { AppRoutingModule } from './app-routing.module';
import { RegistrationComponent } from './registration/registration.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ObservationInputComponent } from './observation-input/observation-input.component';
import { ObservationListComponent } from './observation-list/observation-list.component';
import { ObservationService } from './shared/services/observation.service';
import { IndexedDBService } from './shared/services/indexeddb.service';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoginNavbarComponent } from './shared/login-navbar/login-navbar.component';
import { MainNavbarComponent } from './shared/main-navbar/main-navbar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularIndexedDB } from './shared/services/AngularIndexedDB';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrationComponent,
    ObservationInputComponent,
    ObservationListComponent,
    PageNotFoundComponent,
    LoginNavbarComponent,
    MainNavbarComponent,
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
    ReactiveFormsModule,
    NgbModule.forRoot()
  ],
  providers: [ObservationService, IndexedDBService, AngularIndexedDB, ObservationInputComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
