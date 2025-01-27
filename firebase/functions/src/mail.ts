import { getFirestore } from 'firebase-admin/firestore';

export interface MailMessage {
   to: string;
   message: {
      subject: string;
      text: string;
   };
}

/** Send email using Firebase email extension by creating 
 *  document in  mail collection. 
 */
export async function sendMail(message: MailMessage) {
   const db = getFirestore();

   console.log('Sending mail to' + message.to);
   const id = await db.collection('mail').add(message);
}

// https://invertase.io/blog/send-email-extension