import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

const firebaseApp = initializeApp(environment.firebase);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(()=> firebaseApp),
    {
      provide: "FIREBASE_APP", useValue: firebaseApp
    }
  ]
};

