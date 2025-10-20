import { Component, inject } from '@angular/core';
import { Auth, User, authState } from '@angular/fire/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule, RouterLink],
  template: `
   @if (auth.loggedIn()) {
    <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Auth details">
      <mat-icon>person</mat-icon>
    </button>

    <mat-menu #menu="matMenu">
      <button mat-menu-item (click)="logout()">Logout</button>
     <button mat-menu-item [routerLink]="['/user']">User settings</button>
      <button mat-menu-item [routerLink]="['/auth/change-password']">Change password</button>
    </mat-menu>
  } @else {
      <button mat-icon-button [routerLink]="['/auth/login']">
      <mat-icon>person</mat-icon>
    </button>
  }
`
})
export class AuthButton {
  router = inject(Router);
  auth = inject(AuthService);

  async logout() {
    await this.auth.signOut();
    await this.router.navigateByUrl('auth/login');
  }
}
