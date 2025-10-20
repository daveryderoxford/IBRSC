import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { ListContainerComponent } from "../../shared/components/list-container/list-container.component";
import { ToolbarComponent } from "../../shared/components/toolbar.component";
import { TaskService } from '../task.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FlexModule } from '@ngbracket/ngx-layout';

@Component({
  selector: 'app-completed-list',
  imports: [RouterModule, DatePipe, MatButtonModule, MatCardModule, ToolbarComponent, ListContainerComponent,
    MatListModule, MatDividerModule, MatProgressBarModule, FlexModule],
  templateUrl: './completed-list.html',
  styles: `
  mat-list { 
    overflow: auto; 
  }
  .left {
    flex: 50%;
  }
  .right {
     flex: 30%;
  }
  `,
})
export class CompletedList {

  cs = inject(TaskService);

  id = input.required<string>(); // Route parameter

  task = computed(() => this.cs.findById(this.id())!);

  completed = this.cs.completedTasks.value;

  constructor() {
    effect(() => {
      console.log('CompletedList: Setting selected task: ' + this.id());
      this.cs.setSelectedTask(this.task());
    });
  }
}
