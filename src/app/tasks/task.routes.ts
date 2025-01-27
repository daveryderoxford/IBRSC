import { Routes } from '@angular/router';
import { PendingChangesGuard } from '../shared/services/pending-changes-guard-service.guard';
import { AddTask } from './task-form/task-add';
import { EditTask } from './task-form/task-edit';
import { TaskCalander } from './task-calander/task-calander.component';
import { AuthGuard } from '../auth/guards/auth-guard';
import { CompletedTaskForm } from './completed-task/completed-task';
import { CompletionConfirmation } from './completed-task/completionConfirmation';

export const TASK_ROUTES: Routes = [
  { path: '', component: TaskCalander, canActivate: [AuthGuard] },
  { path: 'add', component: AddTask, canDeactivate: [PendingChangesGuard], canActivate: [AuthGuard] },
  { path: 'edit/:id', component: EditTask, canDeactivate: [PendingChangesGuard], canActivate: [AuthGuard] },
  { path: 'completetask/:id', component: CompletedTaskForm, canDeactivate: [PendingChangesGuard] },
  { path: 'completionConfirmation/:id', component: CompletionConfirmation },
];
 