// Test helpers to initialise Firebase to use the emulator and never a live database.
import test from 'firebase-functions-test';
import { initializeApp, getApps, deleteApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { before, after, afterEach } from 'mocha';

// Set environment variables to use emulators.
// This ensures that tests do not interact with live production data.
process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';
process.env['FIREBASE_AUTH_EMULATOR_HOST'] = 'localhost:9099';
export const projectId = 'demo-splitsbrowser-b5948';
process.env['GCLOUD_PROJECT'] = projectId;

export const testEnv = test({ projectId });

type FunctionsModule = typeof import('../src/index.js');

export interface TestContext {
	db: Firestore;
	myFunctions: FunctionsModule;
}

/**
 * Sets up common Mocha hooks for Firebase Functions tests.
 * This handles app initialization, lazy-loading of functions, and cleanup.
 */
export function setupMochaHooks(): TestContext {
	const context: Partial<TestContext> = {};

	before(async () => {
		initializeApp({ projectId });
		context.db = getFirestore();
		// Dynamically import functions only after the app is initialized. Avoids initialisation function being called
		context.myFunctions = await import('../src/index.js');
	});

	after(async () => {
		testEnv.cleanup();
		// Ensure the app is deleted to prevent state leakage between test files.
		if (getApps().length) {
			await deleteApp(getApps()[0]);
		}
	});

	afterEach(async () => {
		// Use the recommended method for clearing the emulator, is faster but has been found to casuse intermittenmt failure of tests
      // TODO Maybe look into using this later
		// testEnv.clearFirestore();
      try {
         const db = context.db!;
         const collections = await db.listCollections();
         for (const collection of collections) {
            await db.recursiveDelete(collection);
         }
      } catch (error: any) {
         console.log('\n ****** afterEach:  Error in aftereach\n', error.toString());
      }
	});

	return context as TestContext;
}