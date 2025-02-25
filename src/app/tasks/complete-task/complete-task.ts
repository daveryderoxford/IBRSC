import { TextFieldModule } from '@angular/cdk/text-field';
import { Component, computed, effect, inject, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FlexModule } from '@ngbracket/ngx-layout';
import { startOfDay } from 'date-fns';
import { GoogleStorageReference } from '../../shared/components/file-upload/google-storage-ref.model';
import { GggoleStorageUploadComponent } from '../../shared/components/file-upload/google-storage-upload-button';
import { UploadListComponent } from '../../shared/components/file-upload/upload-list/upload-list.component';
import { FormContainerComponent } from '../../shared/components/form-container/form-container.component';
import { ToolbarComponent } from '../../shared/components/toolbar.component';
import { CompletionUserInfo } from '../task.model';
import { TaskService } from '../task.service';
import { DialogsService } from '../../shared';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-complete-task',
  standalone: true,
  imports: [FormContainerComponent, FlexModule, MatDividerModule, MatAutocompleteModule, UploadListComponent,
    GggoleStorageUploadComponent, ToolbarComponent, MatDatepickerModule,
    TextFieldModule, MatExpansionModule, MatOptionModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './complete-task.html',
  styleUrl: './complete-task.scss',
})
export class CompleteTaskForm {
  cs = inject(TaskService);
  router = inject(Router);
  snackbar = inject(MatSnackBar);
  ds = inject(DialogsService);

  id = input.required<string>(); // Task id Route parameter

  // TODO - temp workaround.  Support both the task id and completion id 
  // specified in the route.
  task = computed(() => {
    let t = this.cs.findById(this.id());
    if (!t) {
      t = this.cs.findByNextId(this.id());
    }
    return t!;
  });

  today = startOfDay(new Date());

  form = new FormGroup({
    date: new FormControl(new Date(), { validators: [Validators.required] }),
    submittedBy: new FormControl('', { validators: [Validators.required] }),
    notes: new FormControl(''),
    attachments: new FormControl<GoogleStorageReference[]>([], { nonNullable: true })
  });

  completionId = '';

  constructor() {

    effect( async () => {

      console.log('CompleteTaskForm: Effect running: id' + this.task()?.id);

      const task = this.task();
      if (task) {
        this.completionId = this.cs.getCompletionId();
        this.form.patchValue({
          date: startOfDay(new Date()),
          submittedBy: task.responsible,
          attachments: []
        });
      }
    });
  }

  storageFolder() {
    return `attachments/${this.task()?.id}/${this.completionId}`;
  }

  /** Get/set the attachments from the form control */
  get attachments(): GoogleStorageReference[] {
    return this.form.controls.attachments.getRawValue();
  }

  set attachments(value: GoogleStorageReference[]) {
    this.form.controls.attachments.setValue(value);
  }

  attachmentUploaded(added: GoogleStorageReference[]) {
    this.attachments = [...this.attachments, ...added];
  }

  attachmentDeleted(removed: GoogleStorageReference) {
    const files = this.attachments;

    const index = files.indexOf(removed);
    if (index > -1) {
      files.splice(index, 1);
    }
    this.attachments = [...files];
  }

  submit() {
    const userInfo = this.form.getRawValue() as CompletionUserInfo;

    try {

      this.cs.completeTask(this.completionId, this.task(), userInfo);

      this.form.reset();
      this.router.navigate(['/tasks/completionConfirmation', this.task().id]);

    } catch (error: any) {
      this.snackbar.open("Error encountered completing task", "Error encountered completing task", { duration: 3000 });
      console.log('CompleteTaskForm. Error completing task: ' + error.toString());
    }
  }

  public canDeactivate(): boolean {
    return !this.form.dirty;
  }
}
