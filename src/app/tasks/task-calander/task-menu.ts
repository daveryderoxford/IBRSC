import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { Task } from '../task.model';

@Component({
   selector: 'app-task-menu',
   imports: [MatMenuModule, MatButtonModule, MatIconModule, RouterModule],
   template: `
  <button mat-icon-button [matMenuTriggerFor]="menu">
    <mat-icon>more_vert</mat-icon>
  </button>

  <mat-menu #menu>
   <button mat-menu-item [routerLink]="['/tasks/edit', task().id]">
      <span>Edit</span>
   </button>
   <button mat-menu-item [routerLink]="['/tasks/completetask', task().id]">
      <span>Complete outstanding</span>
   </button>
      <button mat-menu-item [routerLink]="['/tasks/completed', task().id]">
         <span>Previously performed</span>
      </button>
   </mat-menu>
  `,
   styles: ` `
})
export class TaskMenu {

   task = input.required<Task>();

}