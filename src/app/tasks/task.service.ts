import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Firestore, collection, collectionData, deleteDoc, doc, query, setDoc, where } from '@angular/fire/firestore';
import { addDays, compareAsc, startOfDay } from 'date-fns';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { CompletedTask, CompletionUserInfo, Task, completedConverter, taskConverter } from './task.model';
import { firstValueFrom, Observable } from 'rxjs';

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

   findByNextId(nextId: string | undefined): Task | undefined {
      if (!nextId) return undefined;
      return this.tasks().find(task => task.nextId === nextId);
   }

   async update(id: string, task: Partial<Task>): Promise<void> {
      await setDoc(this.ref(id), task, { merge: true });
   }

   async add(task: Partial<Task>): Promise<void> {

      // Get document ref for new document
      const d = doc(this.collectionRef);
      task.id = d.id;
      task.userId = this.auth.user()?.uid;

      await setDoc(d, task);
   }

   async delete(id: string): Promise<void> {
      await deleteDoc(this.ref(id));
   }

   private selectedTask = signal<Task | undefined>(undefined);

   setSelectedTask(task: Task) {
      this.selectedTask.set(task);
   }

   completedTasks = rxResource<CompletedTask[], string>({
      params: () => (this.selectedTask() === undefined) ? '' : this.selectedTask()!.id,
      stream: ({ params: taskId }) => {
         console.log('TaskService: Loading completed tasks for Id:' + taskId);
         const q = query(this.completedCollectionRef, where("taskId", "==", taskId));
         return collectionData(q)
      }
   });

   getCompletionId(): string {
      return( doc(this.completedCollectionRef).id)
   } 

   async completeTask(completionId: string, task: Task, userInfo: CompletionUserInfo): Promise<void> {

      const completed: CompletedTask  = {
         id: completionId,
         taskId: task.id,
         userId: task.userId,
         ...userInfo,
      };
      
      await setDoc(this.completedRef(completionId), completed);

      // update task details with next check
      task.lastCompleted = completed.date;
      task.nextDue = addDays(startOfDay(new Date()), task.interval);
      task.lastReminder = undefined;

      await this.update(task.id, task);
      
   }
}

