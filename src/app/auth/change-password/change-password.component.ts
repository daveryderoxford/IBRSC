import { Component, inject } from '@angular/core';
import { Auth, updatePassword } from '@angular/fire/auth';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { FlexModule } from '@ngbracket/ngx-layout/flex';
import { FormContainerComponent } from '../../shared/components/form-container/form-container.component';
import { ToolbarComponent } from '../../shared/components/toolbar.component';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  imports: [FormContainerComponent, ToolbarComponent, FlexModule, MatCardModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule]
})
export class ChangePasswordComponent {
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private afAuth = inject(Auth);

  error = '';

  form = this.formBuilder.group({
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  }, { validator: this.passwordMissMatch });

  passwordMissMatch(g: FormGroup): ValidationErrors | null {
    const p1 = g.get('password')!;
    const p2 = g.get('confirmPassword')!;
    let ret: ValidationErrors = {};

    if ((p1.touched || p2.touched) &&
      (p1.value !== p2.value) &&
      (p2 !== null)) {
      ret = { passwordMissMatch: true };
    }

    return (ret);
  }

  async changePassword() {

    const user = await this.afAuth.currentUser!;
    const password = this.form.get('password')!.value;

    this.error = '';

    try {
      await updatePassword(user, password);
      this.router.navigateByUrl('/');

    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log('SignupComponent: Error updating password:' + e.message);
      }
      this.error = 'Error updating password';
    }
  }
}
