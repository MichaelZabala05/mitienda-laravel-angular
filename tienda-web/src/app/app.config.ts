import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),                                  // :slug de la URL → input() del componente
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),  // al cambiar de página, sube al inicio
    ),
    provideHttpClient(),
  ],
};
