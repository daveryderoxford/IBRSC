import { inject, Injectable } from '@angular/core';
import { Storage, UploadMetadata, deleteObject, getDownloadURL, listAll, ref, uploadBytes } from '@angular/fire/storage';

import { GoogleStorageReference } from './google-storage-ref.model';

@Injectable({
  providedIn: 'root'
})
export class GoogleStorageService {
  private storage = inject(Storage);

  /** Save list of files to a specified folder in Google storage */
  async saveFileToStorage(files: File[], folder: string): Promise<GoogleStorageReference[]> {

    // Get all files uploaded by user to generate next name
    const listRef = ref(this.storage, folder);
    const allFileNames = await listAll(listRef);
    const firstFileCount = allFileNames.items.length + 1;

    const attachments: GoogleStorageReference[] = [];

    for (const [index, file] of files.entries()) {

      const fileneme = (firstFileCount + index).toString();

      const storagePath = folder + '/' + fileneme;

      // Create the file metadata
      const metadata: UploadMetadata = {
        customMetadata: { originalFilename: file.name }
      };

      // Upload file and metadata to the object 'images/mountains.jpg'
      const storageRef = ref(this.storage, storagePath);
      const snap = await uploadBytes(storageRef, file, metadata);

      const downloadURL = await getDownloadURL(snap.ref);

      const newFile: GoogleStorageReference = {
        storagePath: storagePath,
        originalFilename: file.name,
        url: downloadURL,
      };

      attachments.push(newFile);
    }

    return attachments;

  }

  deleteFile(fileUpload: GoogleStorageReference): void {
    const storageRef = ref(this.storage, fileUpload.storagePath);
    deleteObject(storageRef);
  }

}
