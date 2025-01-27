import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, authState, signOut } from '@angular/fire/auth';
import { map } from 'rxjs';

@Injectable({
   providedIn: 'root'
})
export class AuthService {
   auth = inject(Auth);

   private user$ = authState(this.auth).pipe(
      map(val => val === null ? undefined : val)
   );

   user = toSignal(this.user$);

   loggedIn = computed<boolean>(() => this.user() !== undefined);

   async signOut(): Promise<void> {
      return signOut(this.auth);
   }
}
