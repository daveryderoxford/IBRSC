import { DocumentSnapshot } from '@angular/fire/firestore';
import { GoogleStorageReference } from '../shared/components/file-upload/google-storage-ref.model';

export interface Task {
   id: string;
   userId: string;
   name: string;
   interval: number;  // number of days between 
   lastCompleted: Date;
   nextDue: Date;
   nextId: string;
   responsible: string;
   email: string;
   uploadRequired: boolean;
}

export interface CompletionUserInfo {
   date: Date;
   submittedBy: string;
   notes: string;
   attachments: GoogleStorageReference[];
}

export interface CompletedTask {
   id: string;
   taskId: string;
   date: Date;
   userId: string;
   submittedBy: string;
   notes: string;
   attachments: GoogleStorageReference[];
}


// Firestore data converter
export const taskConverter = {
   toFirestore: (task: Task) => {
      return {
         ...task,
      };
   },
   fromFirestore: (snapshot: DocumentSnapshot<any>, options: any): Task => {
      const data = snapshot.data(options)!;
      return {
         ...data,
         nextDue: data.nextDue?.toDate(),
         lastCompleted: data.lastCompleted?.toDate(),
         interval: parseInt(data.interval)
      } as Task;
   }
};

// Firestore data converter
export const completedConverter = {
   toFirestore: (completed: CompletedTask) => {
      return {
         ...completed,
      };
   },
   fromFirestore: (snapshot: DocumentSnapshot<any>, options: any): CompletedTask => {
      const data = snapshot.data(options)!;
      return {
         ...data,
         date: data.date?.toDate(),
      } as CompletedTask;
   }
};
