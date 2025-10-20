import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ToolbarComponent } from '../shared/components/toolbar.component';

@Component({
  selector: 'app-sys-admin-switchboard',
  imports: [MatButtonModule, ToolbarComponent, RouterLink],
  template: `
    <app-toolbar title="System admin"/>
    <div class=container>
      <div class=buttons>
        <a matButton='tonal' routerLink="/sys-admin/users">
            User administration
        </a>
        <button matButton='tonal' (click)="rebuildRGCache()" [disabled]="busy()">
          Rebuild routegadget index
        </button>
      </div>
      <span class="message">
         {{msgText()}}
      </span>
    </div>
  `,
  styles: `
    :host {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .container {
      width:100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: var(--mat-sys-surface-container-low);    }
    .buttons {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      background-color: white;    
    }
    .message {
      width: 100%;
      text-align: center;
      padding: 20px;
      font-size: 1.2em;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SysAdminSwitchboard {

  msgText = signal('');

  busy = signal(false);

  async rebuildRGCache() {
    console.log('Sys-admin: Rebuilding routegagdget cache...');
    this.busy.set(true);

    try {
     
    } catch (error: any) {
      // Getting the Error details.
      const code = error.code;
      const message = error.message;
      const details = error.details;
      console.log(`Sys-admin: Rebuild RG cache: error code ${code}, message: ${message}, details: ${details}`);
    } finally {
      this.busy.set(false);
    }
  }
}
