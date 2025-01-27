import { Component, inject } from '@angular/core';
import { ToolbarComponent } from "../../shared/components/toolbar.component";
import { TaskService } from '../task.service';
import { MatListModule } from '@angular/material/list';
import { DatePipe } from '@angular/common';
import { ListContainerComponent } from "../../shared/components/list-container/list-container.component";
import { AuthButtonComponent } from "../../auth/auth-button/auth-button.component";
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-task-calander',
  imports: [ToolbarComponent, MatListModule, DatePipe, ListContainerComponent,
    AuthButtonComponent, MatButtonModule, MatIconModule, RouterModule, MatDividerModule],
  templateUrl: './task-calander.component.html',
  styles: `
  .green {
    color: green;
  }
  `
})
export class TaskCalander {
  cs = inject(TaskService);
}
