import { Routes } from '@angular/router';

export const routes: Routes  = [
   { path: '', redirectTo: '/treasurer', pathMatch: 'full' },
   { path: "tasks", loadChildren: () => import('./tasks/task.routes').then(r => r.TASK_ROUTES) },
   { path: "auth", loadChildren: () => import('./auth/auth.routes').then(r => r.AUTH_ROUTES) },
   { path: "user", loadChildren: () => import('./user/user.routes').then(r => r.USER_ROUTES) },
   { path: "treasurer", loadChildren: () => import('./treasurer/treasurer.routes').then(r => r.TREASURER_ROUTES) }

];
