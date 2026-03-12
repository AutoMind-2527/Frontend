import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import Keycloak from 'keycloak-js';

const keycloakConfig = {
  // Use the frontend's own origin so the browser goes through the nginx proxy.
  // Nginx forwards /keycloak/ to if220129, eliminating CORS on the token endpoint.
  url: window.location.origin + '/keycloak',
  realm: 'automind-realm',
  clientId: 'automind-frontend',
};

const keycloak = new Keycloak(keycloakConfig);

// global verfügbar machen für UI-Buttons
(window as any).keycloak = keycloak;
(window as any).keycloakConfig = keycloakConfig;

// Bootstrap app immediately so UI is available even if Keycloak/network is unstable.
const keycloakReady = bootstrapApplication(App, appConfig)
  .then(() => {
    return keycloak
      .init({
        // No onLoad: 'check-sso' — the silent iframe check sends if210096 cookies,
        // but Keycloak session cookies live on if220129, so it always looks unauthenticated.
        // Instead, Keycloak JS auto-detects ?code= in the URL on return from login
        // and does the code exchange via the proxy (no CORS).
        pkceMethod: 'S256',
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
          // Standard flow has a refresh token — silently refresh instead of logging out.
          keycloak.updateToken(30)
            .then(refreshed => {
              if (refreshed && keycloak.token) {
                sessionStorage.setItem('token', keycloak.token);
              }
            })
            .catch(() => {
              sessionStorage.removeItem('token');
              sessionStorage.setItem('isLoggedIn', 'false');
            });
        };
      })
      .catch((err) => {
        console.error('Keycloak initialization failed', err);
        throw err;
      });
  })
  .catch((err) => {
    console.error('App bootstrap failed', err);
    throw err;
  });

(window as any).keycloakReady = keycloakReady;
