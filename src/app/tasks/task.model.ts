import { DocumentSnapshot } from '@angular/fire/firestore';
import { GoogleStorageReference } from '../shared/components/file-upload/google-storage-ref.model';

export interface Task {
   id: string;
   userId: string;
   name: string;
   interval: number;  // number of days between 
   lastCompleted?: Date;
   lastReminder?: Date;
   nextDue: Date;
   nextId: string;
   responsible: string;
   email: string;
   uploadRequired: boolean;
   information: string;
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

// Firestore data converters
// 1. Firebase only supports null while undefined is perferred in project
// 2. Firebase stores dates as Timestamps rather than Javascript dates.  
export const taskConverter = {
   toFirestore: (task: Task) => {
      return {
         ...task,
         lastCompleted: task.lastCompleted === undefined ? null : task.lastCompleted,
         lastReminder: task.lastReminder === undefined ? null : task.lastReminder,
      };
   },
   fromFirestore: (snapshot: DocumentSnapshot<any>, options: any): Task => {
      const data = snapshot.data()!;
      return {
         ...data,
         nextDue: data.nextDue.toDate(),
         lastCompleted: data.lastCompleted === null ? undefined : data.lastCompleted.toDate(),
         lastReminder: data.lastReminder === null ? undefined : data.lastReminder?.toDate(),
         interval: parseInt(data.interval),
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
      const data = snapshot.data()!;
      return {
         ...data,
         date: data.date.toDate(),
      } as CompletedTask;
   },
};
