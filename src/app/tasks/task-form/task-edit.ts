import { Component, computed, inject, input, viewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ToolbarComponent } from "../../shared/components/toolbar.component";
import { Task } from '../task.model';
import { TaskService } from '../task.service';
import { TaskForm } from './task-form';

@Component({
   selector: 'app-task-edit',
   template: `
   <app-toolbar title="Edit Task" />

    <app-task-form [check]="check()" (submitted)="submitted($event)"></app-task-form>
  `,
   styles: [],
   imports: [TaskForm, ToolbarComponent]
})
export class EditTask {
   private cs = inject(TaskService);
   private router = inject(Router);
   private snackbar= inject(MatSnackBar);

   id = input.required<string>();   // Route parameter

   check = computed(() => this.cs.tasks().find(l => l.id === this.id())!);

   readonly form = viewChild.required(TaskForm);

   async submitted(data: Partial<Task>) {
      try {
         await this.cs.update(this.id(), data);
         this.router.navigate(["/tasks"]);
      } catch (error: any) {
         this.snackbar.open("Error encountered updating task", "Error encountered updating task", { duration: 3000 });
         console.log('UpdateTask.   Error updating task: ' + error.toString());
      } 
   }

   canDeactivate(): boolean {
      return this.form().canDeactivate();
   }
}
