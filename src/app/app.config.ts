import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { adminKeyInterceptor } from './interceptors/admin-key.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()), // hash-роутер для Bluehost
    provideHttpClient(withInterceptors([adminKeyInterceptor])),
    provideAnimations(),
    importProvidersFrom(FormsModule, ReactiveFormsModule)
  ]
};
