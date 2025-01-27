import { Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { AuthGuard } from '../auth/guards/auth-guard';
import { PendingChangesGuard } from '../shared/services/pending-changes-guard-service.guard';

export const USER_ROUTES: Routes = [
  { path: "", component: UserComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
];

