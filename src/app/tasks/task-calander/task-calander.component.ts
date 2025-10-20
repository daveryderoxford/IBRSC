import { DatePipe } from '@angular/common';
import { Component, computed, inject, Signal, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { startOfDay } from 'date-fns';
import { AuthButton } from "../../auth/auth-button/auth-button";
import { ListContainerComponent } from "../../shared/components/list-container/list-container.component";
import { ToolbarComponent } from "../../shared/components/toolbar.component";
import { Task } from '../task.model';
import { TaskService } from '../task.service';
import { TaskMenu } from "./task-menu";
import { AuthService } from '../../auth/auth.service';
import { DialogsService } from '../../shared';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

function filterTask(task: Task, filter: string): boolean {
  return !filter || filter === '' ||
    task.name.toLowerCase().includes(filter) ||
    task.responsible.toLowerCase().includes(filter);
}

@Component({
  selector: 'app-task-calander',
  imports: [ToolbarComponent, MatListModule, DatePipe, ListContainerComponent, MatMenuModule,
    AuthButton, MatButtonModule, MatIconModule, RouterModule, MatDividerModule, 
    MatTooltipModule, TaskMenu, ReactiveFormsModule, MatFormFieldModule, MatInputModule,],
  templateUrl: './task-calander.component.html',
  styles: `
  :host {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
  mat-list {
    overflow: auto;
  }
  .full-width {
    width: 100%;
  }
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
  ts = inject(TaskService);

  searchFilter = signal('');
  filteredTasks: Signal<Task[]>;

  constructor(public ls: TaskService,
    public auth: AuthService,
    private router: Router,
    private ds: DialogsService) {

    this.filteredTasks = computed(() => {
      const filter = this.searchFilter();
      return this.ls.tasks().filter((claim) => filterTask(claim, filter));
    });
  }

  searchKeyPressed(filter: string) {
    this.searchFilter.set(filter.toLowerCase());
  }

  overdue(task: Task) {
    return task.nextDue <= startOfDay(new Date());
  }
}
