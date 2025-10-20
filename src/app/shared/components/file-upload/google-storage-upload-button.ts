import { Component, EventEmitter, inject, input, output, Output, signal } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { GoogleStorageReference } from './google-storage-ref.model';
import { GoogleStorageService } from './googleStorage.service';
import { UploadButtonComponent } from './upload-button/upload-button.component';

@Component({
   selector: 'app-google-storage-upload',
   template: `
      <app-upload-button [busy]="busy()" (files)="upload($event)"></app-upload-button>
  `,
   styles: ``,
   imports: [UploadButtonComponent]
})
export class GggoleStorageUploadComponent {
   uploadService = inject(GoogleStorageService);
   as = inject(AuthService);

   folder = input.required<string>();

   uploaded = output<GoogleStorageReference[]>();

   busy = signal(false);

   async upload(files: File[]): Promise<void> {

      let attachments: GoogleStorageReference[] = [];

      try {
         this.busy.set(true);
         attachments = await this.uploadService.saveFileToStorage(files, this.folder());
      } finally {
         this.busy.set(false);
      }

      this.uploaded.emit(attachments);
   }
}
