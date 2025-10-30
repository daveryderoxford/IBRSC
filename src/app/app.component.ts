import { AfterViewInit, Component, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { SidenavService } from './shared/services/sidenav.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule, MatToolbarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  drawer  = viewChild.required<MatSidenav>('drawer');

  private sidenavService = inject(SidenavService);
  private router = inject(Router);
  protected authService = inject(AuthService);

  ngAfterViewInit(): void {
    this.sidenavService.setSidenav(this.drawer());
  }

  async logout() {
    this.drawer().close();
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
