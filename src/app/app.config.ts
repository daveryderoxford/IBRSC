import { ApplicationConfig } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withDebugTracing, withPreloading } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectStorageEmulator } from 'firebase/storage';

import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { firebaseConfig } from './app.firebase-config';
import { environment } from '../environments/environment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DateFnsAdapter, MAT_DATE_FNS_FORMATS, provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { enGB } from 'date-fns/locale';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding(),
      withDebugTracing(),
    ),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => {
      const auth = getAuth();
      if (environment.useEmulator) {
        console.log('Auth emulator configured');
        connectAuthEmulator(auth, 'http://localhost:9099');
      }
      return auth;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (environment.useEmulator) {
        console.log('Firestore emulator configured');
        connectFirestoreEmulator(firestore, 'http://localhost', 8080);
      }
      return firestore;
    }),
    provideStorage(() => {
      const storage = getStorage();
      if (environment.useEmulator) {
        console.log('Storage emulator configured');
        connectStorageEmulator(storage, 'http://localhost', 9199);
      }
      return storage;
    }),
    provideAnalytics(() => getAnalytics()),
    // { provide: ErrorHandler, useClass: GlobalErrorHandler },
    ScreenTrackingService,
    UserTrackingService,

    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: MAT_DATE_LOCALE, useValue: enGB },
    { provide: DateAdapter, useClass: DateFnsAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_DATE_FNS_FORMATS },
    provideDateFnsAdapter(),
    importProvidersFrom(
      MatDialogModule,
      MatSnackBarModule,
    ),
  ]
};
