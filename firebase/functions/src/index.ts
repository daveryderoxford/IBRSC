/**
 * OFixtures Google clould functions exports
 */
import * as admin from "firebase-admin";
import * as user from "./user/user";
import { setGlobalOptions } from "firebase-functions/v2";

setGlobalOptions({ region: "europe-west2" });

const firebaseAdmin = admin.initializeApp();

export { dailyMaintenance } from './daily-mainatinance';
export const createUsder = user.createUser;
export const deleteUsder = user.deleteUser;
