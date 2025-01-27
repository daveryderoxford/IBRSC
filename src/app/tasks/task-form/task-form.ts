
import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FlexModule } from '@ngbracket/ngx-layout/flex';
import { FormContainerComponent } from '../../shared/components/form-container/form-container.component';
import { Task } from '../task.model';
import { startOfDay } from 'date-fns';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.html',
  styles: '',
  imports: [FlexModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDatepickerModule, FormContainerComponent, MatCheckboxModule],
  providers: [provideNativeDateAdapter()],
})
export class TaskForm {

  check = input<Task | undefined>();
  submitted = output<Partial<Task>>();

  form = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    interval: new FormControl(0, { validators: [Validators.required, Validators.min(1), Validators.max(3650)] }),
    lastCompleted: new FormControl<Date>( startOfDay( new Date()), { validators: [Validators.required] }),
    nextDue: new FormControl<Date>(startOfDay(new Date()), { validators: [Validators.required] }),
    responsible: new FormControl('', { validators: [Validators.required] }),
    email: new FormControl('', { validators: [Validators.required] }),
    uploadRequired: new FormControl<boolean>(false)
  });

  constructor() {
    effect(() => {
      if (this.check()) {
        this.form.patchValue(this.check()!);
      }
    });
  }

  submit() {
    const output: Partial<Task> = this.form.getRawValue() as Partial<Task>;
    this.submitted.emit(output);
    this.form.reset();
  }

  public canDeactivate(): boolean {
    return !this.form.dirty;
  }
}
