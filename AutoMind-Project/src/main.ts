import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8090',
  realm: 'automind-realm',
  clientId: 'automind-frontend', // Client in Keycloak fürs Frontend
});

// global verfügbar machen für UI-Buttons
(window as any).keycloak = keycloak;

keycloak
  .init({
    onLoad: 'check-sso',        // Seite darf ohne Zwangs-Login laden
    pkceMethod: 'S256'
    
  })
  .then((authenticated) => {
    if (!authenticated) {
      console.warn('Not authenticated');
    }

    // Token fürs Backend speichern
    if (keycloak.token) {
      sessionStorage.setItem('token', keycloak.token);
    }

    return bootstrapApplication(App, appConfig);
  })
  .catch((err) => console.error('Keycloak init error', err));

// bootstrapApplication(App, appConfig)
//   .catch((err) => console.error(err)); 
