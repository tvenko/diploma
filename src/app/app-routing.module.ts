import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { ObservationInputComponent } from './observation-input/observation-input.component';
import { ObservationListComponent } from './observation-list/observation-list.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AuthGuard } from './shared/services/auth-guard.service';
import { PreparationComponent } from './preparation/preparation.component';

let appRoutes: Routes = [];

if (navigator.onLine) {
  appRoutes = [
    { path: '', redirectTo: '/prijava', pathMatch: 'full'},
    { path: 'prijava', component: LoginComponent },
    { path: 'registracija', component: RegistrationComponent },
    { path: 'meritve', component: ObservationListComponent, canActivate: [AuthGuard] },
    { path: 'meritve/vnos', component: ObservationInputComponent, canActivate: [AuthGuard] },
    { path: 'priprava', component: PreparationComponent, canActivate: [AuthGuard]},
    { path: 'not-found', component: PageNotFoundComponent},
    { path: '**', redirectTo: '/not-found'}
  ];
} else {
  appRoutes = [
    { path: '', redirectTo: '/meritve', pathMatch: 'full'},
    { path: 'meritve', component: ObservationListComponent, canActivate: [AuthGuard] },
    { path: 'meritve/vnos', component: ObservationInputComponent, canActivate: [AuthGuard] },
    { path: 'not-found', component: PageNotFoundComponent},
    { path: '**', redirectTo: '/not-found'}
  ];
}

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
