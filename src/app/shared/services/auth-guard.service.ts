import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import { UserService } from './user.service';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return new Promise((resolve) => {
      resolve(true);
      // this.userService.isAuthenticated()
      //   .then((response) => {
      //     if (response) {
      //       resolve(true);
      //     } else {
      //       this.router.navigate(['/prijava']);
      //       resolve(false);
      //     }
      //   })
      //   .catch(() => {
      //     this.router.navigate(['/prijava']);
      //     resolve(false);
      //   });
    });
  }
}
