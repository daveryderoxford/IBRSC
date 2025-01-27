import { Routes } from '@angular/router';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AuthGuard } from './guards/auth-guard';
import { LoginComponent } from './login/login.component';
import { RecoverComponent } from './recover/recover.component';
import { SignupComponent } from './signup/signup.component';

export const AUTH_ROUTES: Routes = [
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  { path: "recover", component: RecoverComponent },
  { path: "change-password", component: ChangePasswordComponent, canActivate: [AuthGuard] },
];

