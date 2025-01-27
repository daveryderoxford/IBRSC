
import { Injectable, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard  {
      private afAuth = inject(Auth);
      private router = inject(Router);

  canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return authState(this.afAuth).pipe(
      take(1),
      map(user => !!user),
      tap(authenticated => {
        if (!authenticated) {
          // set query parameter returnUrl to redirect to the target url
          const redirectQueryParame = {
            queryParams: { returnUrl: state.url }
          };
          this.router.navigate( [ '/auth/login' ], redirectQueryParame );

        }
      })
    );
  }
}

