import { TextFieldModule } from '@angular/cdk/text-field';
import { Component, computed, effect, inject, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
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

@Component({
  selector: 'app-complete-task',
  standalone: true,
  imports: [FormContainerComponent, FlexModule, MatDividerModule, MatAutocompleteModule, UploadListComponent, 
    GggoleStorageUploadComponent, ToolbarComponent, MatDatepickerModule, 
    TextFieldModule, MatExpansionModule, MatOptionModule, ReactiveFormsModule, 
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './complete-task.html',
  styleUrl: './complete-task.scss',
  providers: [provideNativeDateAdapter()],
})
export class CompleteTaskForm {
  cs = inject(TaskService);
  router = inject(Router);
  snackbar = inject(MatSnackBar);

  id = input.required<string>(); // Task id Route parameter
  task = computed(() => this.cs.findById(this.id())!);

  form = new FormGroup({
    date: new FormControl(new Date(), { validators: [Validators.required] }),
    submittedBy: new FormControl('', { validators: [Validators.required] }),
    notes: new FormControl(''),
    attachments: new FormControl<GoogleStorageReference[]>([], { nonNullable: true })
  });

  constructor() {

    effect(() => {
      const check = this.task();
      if (check) {
        this.form.patchValue({
          date: startOfDay(new Date()),
          submittedBy: check.responsible,
          attachments: []
        });
      }
    });
  }

  storageFolder() {
    return `attachments/${this.task().id}/${this.task().nextId}`
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

      this.cs.completeTask(this.task(), userInfo);

      this.form.reset();
      this.router.navigate(['/tasks/completionConfirmation', this.task().id]);

    } catch (error: any) {
      this.snackbar.open("Error encountered completing task", "Error encountered completing task", { duration: 3000 });
      console.log('CompletionForm. Error completing task: ' + error.toString());
    }
  }

  public canDeactivate(): boolean {
    return !this.form.dirty;
  }
}
