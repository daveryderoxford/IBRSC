import { Routes } from '@angular/router';
import { TreasurerSwitchboard } from './treasurer-switchboard';
import { AccountViewer } from './account-viewer';

export const TREASURER_ROUTES: Routes = [
   { path: '', redirectTo: 'switchboard', pathMatch: 'full' },
   {
      path: 'switchboard',
      component: TreasurerSwitchboard,
      title: 'Treasurer switchboard',
   }, 
   {
      path: 'accounts',
      component: AccountViewer,
      title: 'Accounts',
   }, 

];
