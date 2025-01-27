import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-upload-button',
  standalone: true,
  imports: [CommonModule, MatTooltip, MatButtonModule, MatIconModule, MatProgressBarModule, MatInputModule],
  templateUrl: './upload-button.component.html',
  styleUrls: ['./upload-button.component.scss']
})
export class UploadButtonComponent {

  multipleFiles = input<boolean>(true);
  title = input('Add attachments');
  busy = input(false);

  @Output() files = new EventEmitter<File[]>();

  constructor() { }

  async upload(event: any): Promise<void> {

    const selectedFiles: FileList = event.target.files;

    const files: File[] = [];

    for (let index = 0; index < selectedFiles.length; index++) {
      files.push(selectedFiles[index]);
    }

    this.files.emit(files);
  }

  // Return tooltip text from a function to support multi-line
  getTooltipText(): string {
    return `Image or pdf.  
    For emails, print using 'Save to PDF'
    `;
  }
}
