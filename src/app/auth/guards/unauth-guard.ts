
import { Injectable, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UnauthGuard implements CanActivate {
      private afAuth = inject(Auth);
      private router = inject(Router);

  canActivate(): Observable<boolean> {
    return authState(this.afAuth).pipe(
      take(1),
      map(user => !user),
      tap(unauthenticated => {
        if (!unauthenticated) {
          this.router.navigate(['/']);
        }
      })
    );
  }
}
