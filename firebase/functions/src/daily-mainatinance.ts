

import { differenceInDays, startOfDay } from 'date-fns';
import * as admin from "firebase-admin";
import { onSchedule } from 'firebase-functions/scheduler';
import { Task, taskConverter } from 'model/task.model';
import { MailMessage, sendMail } from './mail';

const TASKS_COLLECTION = 'tasks';
const BASE_URL = '';

const emailIntervals = [0, 7, 14, 30];

/** Run to perfrom maintenance tasks once/day at 02:00 */
export const dailyMaintenance = onSchedule("every day 02:00", async (context) => {

   console.log("Maintenance task start");

   const today = startOfDay(new Date());

   // Find reminders that need to be sent
   const tasks = (await getTasks()).filter(task => task.nextDue <= today);

   for (const task of tasks) {
      if (emailIntervals.includes(differenceInDays(today, task.nextDue))) {
         mailMessage(task);
      }
   }

});

async function getTasks(): Promise<Task[]> {
   const collecton = admin.firestore().collection(TASKS_COLLECTION).withConverter(taskConverter);
   const snapshot = await collecton.get();
   return snapshot.docs.map( snap => snap.data())
}

function mailMessage(task: Task) {

   const msgText = `
Hi ${task.responsible}

${task.name} is due to be completed ${task.nextDue}

Once it is complete, use the link below to report its completion and upload nay related reoirts/certificates.

<a href = '${BASE_URL}/${task.nextId}'> 

Regards
Michelle Ryder
IBRSC H & S Officer
`;

   const msg: MailMessage = {
      to: task.email,
      message: {
         subject: `${task.name} reminder`,
         text: msgText
      }

   };

   sendMail(msg);
}