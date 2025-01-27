import { Component, EventEmitter, Output, signal } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { GoogleStorageReference } from './google-storage-ref.model';
import { GoogleStorageService } from './googleStorage.service';
import { UploadButtonComponent } from './upload-button/upload-button.component';

@Component({
   selector: 'app-google-storage-upload',
   template: `
      <app-upload-button [busy]="busy()" (files)="upload($event)"></app-upload-button>
  `,
   styles: [],
   standalone: true,
   imports: [UploadButtonComponent]
})
export class GggoleStorageUploadComponent {
   constructor(public uploadService: GoogleStorageService,
                      private as: AuthService ) {}

   @Output() uploaded = new EventEmitter<GoogleStorageReference[]>();

   busy = signal(false); 

   async upload(files: File[]): Promise<void> {

      let attachments: GoogleStorageReference[] = [];

      try {
         this.busy.set(true);

         attachments = await this.uploadService.saveFileToStorage(
            files, 
            'claims',
            this.as.user()!.uid
         );
      } finally {
         this.busy.set(false);
      }

      this.uploaded.emit(attachments);
   }
}
