import { Component, computed, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TaskService } from '../task.service';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { BackButtonDirective } from '../../shared/components/back-directive/back-button.direcrtive';
import { ToolbarComponent } from "../../shared/components/toolbar.component";

@Component({
  selector: 'app-completion-confirmation',
  standalone: true,
  imports: [RouterModule, DatePipe, MatButtonModule, MatCardModule, ToolbarComponent],
  template: `
    <app-toolbar title="Task completed" showBack="false"/>
    <div class=center>
    <mat-card class="card" appearance="outlined">
      <mat-card-header>
        <mat-card-title>{{task().name}} completed</mat-card-title>
     </mat-card-header>
     <mat-card-content>
        <p>This task next needs to be performed on {{task().nextDue | date}}</p>
     </mat-card-content>
     <mat-card-actions align="end">
       <button mat-button [routerLink]="['/']">View tasks</button>
    </mat-card-actions>
   </mat-card>
</div>
  `,
  styles: `
  .card {
    margin-top: 25px;
    margin-bottom: 25px;
    max-width: 400px;
    width: 100%;
  }
  .center {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`})
export class CompletionConfirmation {
  cs = inject(TaskService);

  id = input.required<string>(); // Route parameter

  task = computed(() => this.cs.findById(this.id())!);


}