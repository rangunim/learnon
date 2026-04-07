import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { GlobalErrorHandler } from './core/error-handling/global-error.handler';
import { provideServiceWorker } from '@angular/service-worker';

const learnOnPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fdf2f6',
      100: '#fbe4ee',
      200: '#f8cde0',
      300: '#f3a8c8',
      400: '#eb77a5',
      500: '#df4883',
      600: '#d81265',
      700: '#bb0b51',
      800: '#9d0c47',
      900: '#840f40',
      950: '#510423',
    },
    colorScheme: {
      dark: {
        surface: {
          border: '{surface.700}',
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, httpErrorInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: learnOnPreset,
        options: {
          darkModeSelector: '.p-dark',
        },
      },
    }),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: ConfirmationService, useClass: ConfirmationService },
    { provide: MessageService, useClass: MessageService },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};

function initializeFontAwesome(library: FaIconLibrary): void {
  library.addIconPacks(fas, far, fab);
}
