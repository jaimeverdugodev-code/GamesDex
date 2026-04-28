import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// 1. Importamos tu archivo de variables (donde pegaste las claves)
import { environment } from './environments/environment';

// 2. Importamos las herramientas de Firebase
import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, initializeFirestore } from '@angular/fire/firestore';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // 3. Conectamos Firebase usando tus claves del environment
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    // getApp() obtiene la instancia ya registrada por provideFirebaseApp. initializeFirestore con
    // experimentalForceLongPolling + experimentalAutoDetectLongPolling evita que CapacitorHttp
    // rompa el WebChannel de Firestore en Android (AngularFire 17+).
    provideFirestore(() => {
      const app = getApp();
      return initializeFirestore(app, {
        experimentalForceLongPolling: true
      });
    }),
  ],
});