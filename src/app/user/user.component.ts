
import { Component, effect, inject } from "@angular/core";
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatOptionModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSelectModule } from "@angular/material/select";
import { Router } from "@angular/router";
import { ExtendedModule } from "@ngbracket/ngx-layout/extended";
import { FlexModule } from "@ngbracket/ngx-layout/flex";
import { AuthService } from '../auth/auth.service';
import { FormContainerComponent } from "../shared/components/form-container/form-container.component";
import { ToolbarComponent } from "../shared/components/toolbar.component";
import { UserDataService } from "./user-data.service";
import { UserData } from './user.model';

@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.scss"],
  imports: [ToolbarComponent, FlexModule, ReactiveFormsModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ExtendedModule, MatSelectModule, MatOptionModule, FormContainerComponent]
})
export class UserComponent {
  protected afAuth = inject(AuthService);
  private usd = inject(UserDataService);
  private formBuilder = inject(NonNullableFormBuilder);
  private router = inject(Router);

  showProgressBar = false;
  busy = false;

  protected userForm = this.formBuilder.group({
    name: new FormControl("", [Validators.required])
  });

  constructor() {

    effect(() => {
      const userData = this.usd.userdata();

      if (userData) {
        this.userForm.patchValue({
          name: userData.name
        });
      }
    });

    // Navigate away if we aare logged out
    effect(() => {
      if (!this.afAuth.loggedIn()) {
        this.router.navigate(["/"]);
      }
    });
  }

  async save() {

    this.busy = true;
    try {
      await this.usd.updateDetails(this.userForm.value as UserData);
      this.userForm.reset();
      this.router.navigate(["/"]);
    } finally {
      this.busy = false;
    }
  }

  canDeactivate(): boolean {
    return !this.userForm.dirty;
  }
}
