import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://if220129.cloud.htl-leonding.ac.at/keycloak',
  realm: 'automind-realm',
  clientId: 'automind-frontend',
});

// global verfügbar machen für UI-Buttons
(window as any).keycloak = keycloak;

keycloak
  .init({
    onLoad: 'check-sso',
    pkceMethod: 'S256',
    checkLoginIframe: true,
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
  })
  .then((authenticated) => {
    console.log('Keycloak initialized. Authenticated:', authenticated);

    // Token fürs Backend speichern
    if (keycloak.token) {
      sessionStorage.setItem('token', keycloak.token);
      sessionStorage.setItem('isLoggedIn', 'true');
    }

    // Keep sessionStorage token up-to-date on auth events
    keycloak.onAuthSuccess = () => { 
      if (keycloak.token) {
        sessionStorage.setItem('token', keycloak.token); 
        sessionStorage.setItem('isLoggedIn', 'true');
      }
    };
    keycloak.onAuthRefreshSuccess = () => { 
      if (keycloak.token) sessionStorage.setItem('token', keycloak.token); 
    };
    keycloak.onAuthLogout = () => { 
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('isLoggedIn');
    };
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30)
        .then(() => { if (keycloak.token) sessionStorage.setItem('token', keycloak.token); })
        .catch(() => { console.warn('Token refresh failed'); });
    };

    return bootstrapApplication(App, appConfig);
  })
  .catch((err) => {
    console.error('Keycloak initialization failed', err);
  });
