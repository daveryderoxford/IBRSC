import { Injectable } from '@angular/core';
import { Storage, UploadMetadata, deleteObject, getDownloadURL, listAll, ref, uploadBytes } from '@angular/fire/storage';

import { GoogleStorageReference } from './google-storage-ref.model';

export type RootPath = 'claims' | 'invoices';

@Injectable({
  providedIn: 'root'
})
export class GoogleStorageService {

  constructor(private storage: Storage) { }

  async saveFileToStorage(files: File[],
    rootPath: RootPath,
    userId: string): Promise<GoogleStorageReference[]> {

    const userPath = `${rootPath}/${userId}`;

    // Get all files uploaded by user to generate next name
    const listRef = ref(this.storage, userPath);
    const allFileNames = await listAll(listRef);
    const firstFileCount = allFileNames.items.length + 1;

    const attachments: GoogleStorageReference[] = [];

    for (const [index, file] of files.entries()) {

      const fileneme = (firstFileCount + index).toString();

      const storagePath = userPath + '/' + fileneme;

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
