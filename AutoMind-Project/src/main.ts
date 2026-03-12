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

// Bootstrap app immediately so UI is available even if Keycloak/network is unstable.
bootstrapApplication(App, appConfig)
  .then(() => {
    keycloak
      .init({
        flow: 'implicit',
        checkLoginIframe: false,
        enableLogging: true
      })
      .then((authenticated) => {
        console.log('Keycloak initialized. Authenticated:', authenticated);

        if (keycloak.token) {
          sessionStorage.setItem('token', keycloak.token);
          sessionStorage.setItem('isLoggedIn', 'true');
        }

        // Chain existing handlers (e.g. those set by AuthService) instead of overwriting.
        const prevOnAuthSuccess = keycloak.onAuthSuccess;
        const prevOnAuthRefreshSuccess = keycloak.onAuthRefreshSuccess;
        const prevOnAuthLogout = keycloak.onAuthLogout;

        keycloak.onAuthSuccess = () => {
          if (typeof prevOnAuthSuccess === 'function') prevOnAuthSuccess();
          if (keycloak.token) {
            sessionStorage.setItem('token', keycloak.token);
            sessionStorage.setItem('isLoggedIn', 'true');
          }
        };

        keycloak.onAuthRefreshSuccess = () => {
          if (typeof prevOnAuthRefreshSuccess === 'function') prevOnAuthRefreshSuccess();
          if (keycloak.token) {
            sessionStorage.setItem('token', keycloak.token);
          }
        };

        keycloak.onAuthLogout = () => {
          if (typeof prevOnAuthLogout === 'function') prevOnAuthLogout();
          sessionStorage.removeItem('token');
          sessionStorage.setItem('isLoggedIn', 'false');
        };

        keycloak.onTokenExpired = () => {
          // In implicit flow there is no refresh token. Keep app stable instead
          // of forcing failing token endpoint calls.
          sessionStorage.removeItem('token');
          sessionStorage.setItem('isLoggedIn', 'false');
        };
      })
      .catch((err) => {
        console.error('Keycloak initialization failed', err);
      });
  })
  .catch((err) => {
    console.error('App bootstrap failed', err);
  });
