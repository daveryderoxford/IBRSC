import * as admin from "firebase-admin";
// Note Authentication triggers are only supported for v1 functions currently
import * as functions from "firebase-functions/v1"; 
import { UserData } from "./user.model";

/** Creates new user data and saves it to the database */
function createUserData(): UserData {
    const userdata: UserData = {
        key: "",
        name: "",
        email: "",
    };
    return userdata;
}

export const createUser = functions.region("europe-west2").auth.user().onCreate(async (user: any, context) => {
    // Create user data when a user is created
    const userdata = createUserData();
    userdata.key = user.uid;
    userdata.email = user.email;
    try {
        await admin.firestore().doc('users/' + user.uid).set(userdata);
        console.log('Creating user data for ' + user.uid);
    } catch (err) {
        console.error('createUser: Error encountered creating user data.  User Id: ' + user.uid + "  " + err.toString());
    }
});

export const deleteUser = functions.region("europe-west2").auth.user().onDelete(async (user: any) => {
    // When a user is deleted mark the user data as archived
    try {
        await admin.firestore().doc('users/' + user.uid).update({ archived: true });
    } catch (err) {
        console.error('deleteUser: Error encountered marking deleted user as archived.  User Id: ' + user.uid + "  " + err.toString());
    }
});
