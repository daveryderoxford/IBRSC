import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';

import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SidenavService } from './shared/services/sidenav.service';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule, MatToolbarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  title = 'ibrsc';
  @ViewChild('drawer') private drawer!: MatSidenav;
  private sidenavService = inject(SidenavService);
  private router = inject(Router);
  protected authService = inject(AuthService);

  ngAfterViewInit(): void {
    this.sidenavService.setSidenav(this.drawer);
  }

  async logout() {
    this.drawer.close();
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
