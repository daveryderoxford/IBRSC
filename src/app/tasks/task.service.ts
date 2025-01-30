import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Firestore, collection, collectionData, deleteDoc, doc, query, setDoc, where } from '@angular/fire/firestore';
import { addDays, compareAsc, startOfDay } from 'date-fns';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { CompletedTask, CompletionUserInfo, Task, completedConverter, taskConverter } from './task.model';

const TASK_COLLECTION = 'tasks';
const COMPLETED_COLLECTION = 'completedtasks';

@Injectable({
   providedIn: 'root'
})
export class TaskService {
   private fs = inject(Firestore);
   private auth = inject(AuthService);

   private ref = (id: string) => doc(this.fs, TASK_COLLECTION, id).withConverter(taskConverter);
   private collectionRef = collection(this.fs, TASK_COLLECTION).withConverter(taskConverter);

   private completedRef = (id: string) => doc(this.fs, COMPLETED_COLLECTION, id).withConverter(completedConverter);
   private completedCollectionRef = collection(this.fs, COMPLETED_COLLECTION).withConverter(completedConverter);

   private tasks$ = collectionData<Task>(this.collectionRef).pipe(
      map(tasks => tasks.sort((a, b) => compareAsc(a.nextDue, b.nextDue)),
   ));

   /** Tasks ordered by date next task is due */
   tasks = toSignal(this.tasks$, { initialValue: [] });

   findById(id: string | undefined): Task | undefined {
      if (!id) return undefined;
      return this.tasks().find(task => task.id === id);
   }

   async update(id: string, task: Partial<Task>): Promise<void> {
      await setDoc(this.ref(id), task, { merge: true });
   }

   async add(task: Partial<Task>): Promise<void> {

      // Get document ref for new document
      const d = doc(this.collectionRef);
      task.id = d.id;
      task.userId = this.auth.user()?.uid;
      task.nextId = doc(this.completedCollectionRef).id;

      await setDoc(d, task);
   }

   async delete(id: string): Promise<void> {
      await deleteDoc(this.ref(id));
   }

   completedTasks(taskId: string): Signal<CompletedTask[]> {
      const q = query(this.completedCollectionRef,where("taskId", "==", taskId));
      return toSignal(collectionData(q), {initialValue: []});
   }

   async completeTask(task: Task, userInfo: CompletionUserInfo): Promise<void> {

      const completed: CompletedTask  = {
         id: task.nextId,
         taskId: task.id,
         userId: task.userId,
         ...userInfo,
      };
      
      await setDoc(this.completedRef(task.nextId), completed);

      // update task details with next check
      task.nextId = doc(this.completedCollectionRef).id;
      task.lastCompleted = completed.date;
      task.nextDue = addDays(startOfDay(new Date()), task.interval);
      task.lastReminder = undefined;

      await this.update(task.id, task);
      
   }
}

