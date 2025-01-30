import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { startOfDay } from 'date-fns';
import { AuthButtonComponent } from "../../auth/auth-button/auth-button.component";
import { ListContainerComponent } from "../../shared/components/list-container/list-container.component";
import { ToolbarComponent } from "../../shared/components/toolbar.component";
import { Task } from '../task.model';
import { TaskService } from '../task.service';
import { TaskMenu } from "./task-menu";

@Component({
  selector: 'app-task-calander',
  imports: [ToolbarComponent, MatListModule, DatePipe, ListContainerComponent, MatMenuModule,
    AuthButtonComponent, MatButtonModule, MatIconModule, RouterModule, MatDividerModule, MatTooltipModule, TaskMenu],
  templateUrl: './task-calander.component.html',
  styles: `
  .icon-color {
    color: green;
  }
  .overdue {
    color: red;
    font-weight: bold;
  }
  `
})
export class TaskCalander {
  cs = inject(TaskService);

  overdue(task: Task) {
    return task.nextDue <= startOfDay(new Date());
  }
}
