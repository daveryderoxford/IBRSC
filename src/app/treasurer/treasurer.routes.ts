import { Routes } from '@angular/router';
import { SysAdminSwitchboard } from './treasurer-switchboard';
import { getFunctions, provideFunctions } from '@angular/fire/functions';

export const TREASURER_ROUTES: Routes = [
   { path: '', redirectTo: 'switchboard', pathMatch: 'full' },
   {
      path: 'switchboard',
      component: SysAdminSwitchboard,
      title: 'System Administration',
      providers: [
         provideFunctions(() => getFunctions()),
      ],
   }, 
];
