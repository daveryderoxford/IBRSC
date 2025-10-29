import { Component, inject, viewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ToolbarComponent } from "../../shared/components/toolbar.component";
import { Task } from '../task.model';
import { TaskService } from '../task.service';
import { TaskForm } from './task-form';

@Component({
   selector: 'app-task-add',
   template: `
   <app-toolbar title="Add Task" showBack/>
    <app-task-form (submitted)="submitted($event)"></app-task-form>
  `,
   styles: [],
   imports: [TaskForm, ToolbarComponent]
})
export class AddTask {
   private ts = inject(TaskService);
   private router = inject(Router);
   private snackbar= inject(MatSnackBar);

   readonly form = viewChild.required(TaskForm);

   async submitted(task: Partial<Task>) {
      try {
         await this.ts.add(task);
         this.router.navigate(["/"]);
      } catch (error: any) {
         this.snackbar.open("Error encountered adding task", "Error encountered adding task", { duration: 3000 });
         console.log('AddTask.   Error adding task: ' + error.toString());
      } 
   }

   canDeactivate(): boolean {
      return this.form().canDeactivate();
   }
}