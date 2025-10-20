import { Routes } from '@angular/router';
import { ChangePassword } from './change-password/change-password';
import { AuthGuard } from './guards/auth-guard';
import { LoginPage } from './login/login';
import { RecoverComponent } from './recover/recover-password';
import { Signup } from './signup/signup';

export const AUTH_ROUTES: Routes = [
  { path: "login", component: LoginPage },
  { path: "signup", component: Signup },
  { path: "recover", component: RecoverComponent },
  { path: "change-password", component: ChangePassword, canActivate: [AuthGuard] },
];

