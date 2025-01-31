import { Component, computed, inject, input, viewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ToolbarComponent } from "../../shared/components/toolbar.component";
import { Task } from '../task.model';
import { TaskService } from '../task.service';
import { TaskForm } from './task-form';
import { DialogsService } from '../../shared';

@Component({
   selector: 'app-task-edit',
   template: `
   <app-toolbar title="Edit Task" />

    <app-task-form [task]="task()" (submitted)="submitted($event)" (deleted)="deleted($event)"></app-task-form>
  `,
   styles: [],
   imports: [TaskForm, ToolbarComponent]
})
export class EditTask {
   private ts = inject(TaskService);
   private router = inject(Router);
   private snackbar = inject(MatSnackBar);
   private ds = inject(DialogsService);

   id = input.required<string>();   // Route parameter

   task = computed(() => this.ts.tasks().find(l => l.id === this.id())!);

   readonly form = viewChild.required(TaskForm);

   async submitted(data: Partial<Task>) {
      try {
         await this.ts.update(this.id(), data);
         this.router.navigate(["/tasks"]);
      } catch (error: any) {
         this.snackbar.open("Error encountered updating task", "Error encountered updating task", { duration: 3000 });
         console.log('UpdateTask. Error updating task: ' + error.toString());
      }
   }

   async deleted(task: Task) {
      const ok = await this.ds.confirm("Delete task", "Delete task");
      if (ok) {
         try {
            await this.ts.delete(task.id);
            this.router.navigate(["/tasks"]);
         } catch (error: any) {
            this.snackbar.open("Error encountered deleting task", "Error encountered deleting task", { duration: 3000 });
            console.log('UpdateTask.   Error deleting task: ' + error.toString());
         }
      }
   }

   canDeactivate(): boolean {
      return this.form().canDeactivate();
   }
}
