import 'mocha';
import test from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { expect } from 'chai';
import { subDays, startOfDay } from 'date-fns';
import { sinon  } from 'sinon';

// Import the modules to be tested/stubbed
import * as mail from '../mail';
import { dailyMaintenance } from '../daily-mainatinance';
import { Task, taskConverter } from '../model/task.model';

// Initialize firebase-functions-test.
// It is configured to use the Firestore emulator if FIRESTORE_EMULATOR_HOST is set.
const testEnv = test({
  projectId: 'ibrsc-7619b-test',
});

const TASKS_COLLECTION = 'tasks';

describe('dailyMaintenance scheduled function', () => {
  let sendMailStub: sinon.SinonStub;
  let firestore: admin.firestore.Firestore;

  before(() => {
    // Get a reference to the emulated firestore
    firestore = admin.firestore();
  });

  beforeEach(async () => {
    // Stub the sendMail function to prevent sending real emails
    sendMailStub = sinon.stub(mail, 'sendMail');
    // Clear the tasks collection before each test
    await testEnv.firestore.clearFirestoreData({ projectId: 'ibrsc-7619b-test' });
  });

  afterEach(() => {
    // Restore stubs and cleanup
    sendMailStub.restore();
    sinon.restore();
  });

  after(() => {
    // Do cleanup tasks
    testEnv.cleanup();
  });

  it('should send reminders for overdue tasks without a recent reminder', async () => {
    const today = startOfDay(new Date());

    // --- Test Data ---
    const tasks: Partial<Task>[] = [
      // 1. Overdue, no reminder sent yet. Should send email.
      {
        name: 'Overdue Task 1',
        nextDue: subDays(today, 10),
        responsible: 'User A',
        email: 'user.a@example.com',
        lastReminder: undefined,
      },
      // 2. Overdue, but reminder sent recently (3 days ago). Should NOT send email.
      {
        name: 'Overdue Task 2',
        nextDue: subDays(today, 5),
        responsible: 'User B',
        email: 'user.b@example.com',
        lastReminder: subDays(today, 3),
      },
      // 3. Overdue, reminder sent long ago (8 days ago). Should send email.
      {
        name: 'Overdue Task 3',
        nextDue: subDays(today, 15),
        responsible: 'User C',
        email: 'user.c@example.com',
        lastReminder: subDays(today, 8),
      },
      // 4. Not overdue. Should NOT send email.
      {
        name: 'Future Task',
        nextDue: subDays(today, -5), // Due in 5 days
        responsible: 'User D',
        email: 'user.d@example.com',
        lastReminder: undefined,
      },
    ];

    // Seed the database
    const taskRefs = await Promise.all(
      tasks.map(task => firestore.collection(TASKS_COLLECTION).add(task))
    );

    // --- Execute the function ---
    // We need to wrap the cloud function to test it.
    const wrapped = testEnv.wrap(dailyMaintenance);
    await wrapped({});

    // --- Assertions ---

    // 1. Check that sendMail was called for the correct tasks
    expect(sendMailStub.callCount).to.equal(2, 'sendMail should be called twice');

    // Check call for 'Overdue Task 1'
    expect(sendMailStub.getCall(0).args[0].to).to.include('user.a@example.com');
    expect(sendMailStub.getCall(0).args[0].message.subject).to.equal('Overdue Task 1 reminder');

    // Check call for 'Overdue Task 3'
    expect(sendMailStub.getCall(1).args[0].to).to.include('user.c@example.com');
    expect(sendMailStub.getCall(1).args[0].message.subject).to.equal('Overdue Task 3 reminder');

    // 2. Check that lastReminder was updated in Firestore for the tasks that received an email
    const task1Doc = await firestore.collection(TASKS_COLLECTION).doc(taskRefs[0].id).withConverter(taskConverter).get();
    const task1Data = task1Doc.data();
    expect(task1Data?.lastReminder?.getTime()).to.equal(today.getTime(), 'Task 1 lastReminder should be updated to today');

    const task3Doc = await firestore.collection(TASKS_COLLECTION).doc(taskRefs[2].id).withConverter(taskConverter).get();
    const task3Data = task3Doc.data();
    expect(task3Data?.lastReminder?.getTime()).to.equal(today.getTime(), 'Task 3 lastReminder should be updated to today');

    // 3. Check that lastReminder was NOT updated for other tasks
    const task2Doc = await firestore.collection(TASKS_COLLECTION).doc(taskRefs[1].id).withConverter(taskConverter).get();
    const task2Data = task2Doc.data();
    expect(task2Data?.lastReminder?.getTime()).to.equal(subDays(today, 3).getTime(), 'Task 2 lastReminder should not be changed');
  });
});