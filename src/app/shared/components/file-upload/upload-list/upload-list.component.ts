import { Component, EventEmitter, Output, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { GoogleStorageReference } from '../google-storage-ref.model';
import { GoogleStorageService } from '../googleStorage.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-upload-list',
  templateUrl: './upload-list.component.html',
  styleUrls: ['./upload-list.component.css'],
  standalone: true,
  imports: [MatListModule, MatIconModule, MatButtonModule],
})
export class UploadListComponent {

  files = input<GoogleStorageReference[]>([]);
  canDelete = input<boolean>(true);

  @Output() deleted = new EventEmitter<GoogleStorageReference>();
      
  constructor(public uploadService: GoogleStorageService) {  }

  deleteFileUpload(fileUpload: GoogleStorageReference): void {
    this.deleted.emit(fileUpload);
    this.uploadService.deleteFile(fileUpload);
  }
}
