import { Component, booleanAttribute, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { BackButtonDirective } from './back-directive/back-button.direcrtive';

@Component({
  selector: 'app-toolbar',
  template: `
<mat-toolbar class=app-toolbar>
   @if (showBack()) {
      <button mat-icon-button navigateBack>
        <mat-icon>arrow_back</mat-icon>
      </button>
   }
   {{title()}}
   <div class=spacer></div>
   <ng-content/>
</mat-toolbar>
    `,
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterModule, BackButtonDirective],
  styles: ['.spacer { flex: 1 1 auto; }']

})
export class ToolbarComponent {

  title = input('');

  showBack = input(true, { transform: booleanAttribute });

  constructor() { }

}
