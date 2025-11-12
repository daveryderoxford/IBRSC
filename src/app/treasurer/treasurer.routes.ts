import { Routes } from '@angular/router';
import { AccountViewer } from './account-viewer';

export const TREASURER_ROUTES: Routes = [
   { path: '', redirectTo: 'accounts', pathMatch: 'full' },
   {
      path: 'accounts',
      component: AccountViewer,
      title: 'Accounts',
   },
];
