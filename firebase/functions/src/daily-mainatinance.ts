

import { differenceInDays, format, startOfDay } from 'date-fns';
import * as admin from "firebase-admin";
import { Task, taskConverter } from './model/task.model';
import { MailMessage, sendMail } from './mail';
// eslint-disable-next-line import/no-unresolved
import { onSchedule } from 'firebase-functions/v2/scheduler';

const TASKS_COLLECTION = 'tasks';
const BASE_URL = 'https://ibrsc-7619b.web.app';

const reminderInterval = 7;
const hsemail = 'ryder_michelle@hotmail.com'

/** Run to perfrom maintenance tasks once/day at 02:00 */
export const dailyMaintenance = onSchedule("every day 02:00", async (context) => {

   console.log("Maintenance task start");

   const today = startOfDay(new Date());

   // Find reminders that need to be sent
   const tasks = (await getTasks()).filter(task => task.nextDue <= today);
   console.log(`   Found ${tasks.length} overdue tasks`);

   for (const task of tasks) {
      if (!task.lastReminder || differenceInDays(today, task.lastReminder) >= reminderInterval) {
         await mailMessage(task);

         const ref = admin.firestore().doc(TASKS_COLLECTION + "/" + task.id).withConverter(taskConverter);
         await ref.update({ lastReminder: today})
         
      } else {
         console.log(`   Reminder for ${task.name} to ${task.responsible} not  due to be sent today`);
      }
   }

   console.log("Maintenance task end");
});

async function getTasks(): Promise<Task[]> {
   const collecton = admin.firestore().collection(TASKS_COLLECTION).withConverter(taskConverter);
   const snapshot = await collecton.get();
   return snapshot.docs.map( snap => snap.data())
}

async function mailMessage(task: Task) {
   console.log(`   Sending mail for ${task.name} to ${task.responsible} at ${task.email}`);

   const dateStr = format(task.nextDue, 'dd/MM/yyyy');

   const msgText = `
Hi ${task.responsible}

${task.name} is due to be completed by ${dateStr}.

Report completion using the link below.

${BASE_URL}/tasks/completetask/${task.id}

Regards
Michelle Ryder
IBRSC H & S Officer
`;

   const msg: MailMessage = {
      to: task.email + ',' + hsemail,
      message: {
         subject: `${task.name} reminder`,
         text: msgText,
      },
   };

   await sendMail(msg);
}
