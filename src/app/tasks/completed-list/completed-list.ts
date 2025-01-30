import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from "../../shared/components/toolbar.component";
import { TaskService } from '../task.service';
import { ListContainerComponent } from "../../shared/components/list-container/list-container.component";
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-completed-list',
  standalone: true,
  imports: [RouterModule, DatePipe, MatButtonModule, MatCardModule, ToolbarComponent, ListContainerComponent,
    MatListModule, MatDividerModule],
  templateUrl: './completed-list.html',
  styles: '',
})
export class CompletedList {

  cs = inject(TaskService);

  id = input.required<string>(); // Route parameter

  task = computed(() => this.cs.findById(this.id())!);

  completed = this.cs.completedTasks(this.id()!);

  constructor() {
    effect(() => {
      console.log('task id: ' + this.id());
    });
  }
}
