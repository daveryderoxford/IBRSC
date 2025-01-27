import { Component, viewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TaskForm } from './task-form';
import { TaskService } from '../task.service';
import { Task } from '../task.model';
import { ToolbarComponent } from "../../shared/components/toolbar.component";

@Component({
   selector: 'app-task-add',
   template: `
   <app-toolbar title="Add Task" />
    <app-task-form (submitted)="submitted($event)"></app-task-form>
  `,
   styles: [],
   imports: [TaskForm, ToolbarComponent]
})
export class AddTask {
   private fs = inject(TaskService);
   private router = inject(Router);

   readonly form = viewChild.required(TaskForm);

   async submitted(task: Partial<Task>) {
      await this.fs.add(task);
      this.router.navigate(["/"]);
   }

   canDeactivate(): boolean {
      return this.form().canDeactivate();
   }
}