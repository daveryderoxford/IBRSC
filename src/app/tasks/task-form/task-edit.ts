import { Component, computed, effect, inject, input, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../task.service';
import { Task } from '../task.model';
import { TaskForm } from './task-form';
import { ToolbarComponent } from "../../shared/components/toolbar.component";

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

   id = input<string>('');   // Route parameter

   check = computed(() => this.cs.tasks().find(l => l.id === this.id())!);

   readonly form = viewChild.required(TaskForm);

   async submitted(data: Partial<Task>) {
      await this.cs.update(this.id(), data);
      this.router.navigate(["/tasks"]);
   }

   canDeactivate(): boolean {
      return this.form().canDeactivate();
   }
}
