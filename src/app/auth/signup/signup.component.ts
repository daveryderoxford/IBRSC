import { Component, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { FlexModule } from '@ngbracket/ngx-layout/flex';
import { FormContainerComponent } from '../../shared/components/form-container/form-container.component';
import { ToolbarComponent } from "../../shared/components/toolbar.component";

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    imports: [FormContainerComponent,  FlexModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterLink, ToolbarComponent]
})
export class SignupComponent {
    private router = inject(Router);
    private formBuilder = inject(FormBuilder);
    private afAuth = inject(Auth);

    signupForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
    }, { validator: this.passwordMissMatch });

    error = '';

    passwordMissMatch(g: FormGroup): any {
        const p1 = g.get('password')!;
        const p2 = g.get('confirmPassword')!;
        let ret: { [error: string]: any; } = {};

        if ((p1.touched || p2.touched) &&
            (p1.value !== p2.value) &&
            (p2 !== null)) {
            ret = { passwordMissMatch: true };
        }

        return (ret);
    }

    async signup() {

        const email = this.signupForm.get('email')!.value!;
        const password = this.signupForm.get('password')!.value!;

        this.error = '';

        try {
            await createUserWithEmailAndPassword(this.afAuth, email, password);

            // User is automatically signed in so get the current user and send verification email
            const user = this.afAuth.currentUser;
            if (user) {
                await sendEmailVerification(user);
            } else {
                console.log('User enexpectely null');
            }

            this.router.navigateByUrl('/user');

        } catch (error) {
            if (error instanceof Error) {
                console.log('SignupComponent: Error creating user code:' + error.message);
                this.error = error.message;
            } else {
                console.log('SignupComponent: unexpected error');
            }
        }
    }
}
