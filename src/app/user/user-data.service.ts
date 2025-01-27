import { Injectable, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Auth, authState } from "@angular/fire/auth";
import { DocumentReference, Firestore, doc, docData, updateDoc } from "@angular/fire/firestore";
import { of } from 'rxjs';
import { shareReplay, startWith, switchMap } from 'rxjs/operators';
import { UserData } from './user.model';

@Injectable({
  providedIn: "root"
})
export class UserDataService {
  private auth = inject(Auth);
  private fs = inject(Firestore);

  private userdata$ = authState(this.auth).pipe(
    switchMap((u) => {
      if (!u) {
        console.log("UserData: Firebase user null.  Stop monitoring user date  ");
        return of(null);
      } else {
        console.log(`UserData: monitoring uid: ${u.uid}`);
        return docData(this._doc(u.uid));
      }
    }),
    startWith(null),

    shareReplay(1)
  );

  userdata = toSignal(this.userdata$);

  /** Update the user info.  Returning the modified user details */
  async updateDetails(details: Partial<UserData>): Promise<void> {
    if (this.userdata()) {
      console.log('UserDataService: Saving user' + this.userdata()!.key);
      const doc = this._doc(this.userdata()!.key);
      return updateDoc(doc, details);
    } else {
      console.log('UserDataService: Saving user: Unexectly null');
      throw Error('UserDataService: Saving user: Unexectly null');
    }
  }

  private _doc(uid: string): DocumentReference<UserData> {
    return doc(this.fs, "users/" + uid) as DocumentReference<UserData>;
  }
}
