/**
 * OFixtures Google clould functions exports
 */
import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions/v2";

setGlobalOptions({ region: "europe-west2" });

admin.initializeApp();

export { 
   dailyMaintenance,
} from './daily-mainatinance';

export {
   createUser,
   deleteUser,
} from "./user/user";

