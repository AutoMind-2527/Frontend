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

// Development mode: Skip Keycloak, use mock token
const DEV_MODE = true;

if (DEV_MODE) {
  // Use mock token for development
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldiBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  sessionStorage.setItem('token', mockToken);
  bootstrapApplication(App, appConfig).catch((err) => console.error(err));
} else {
  keycloak
    .init({
      onLoad: 'login-required',
      pkceMethod: 'S256',
      checkLoginIframe: false
    })
    .then((authenticated) => {
      if (!authenticated) {
        console.warn('Not authenticated');
      }

      // Token fürs Backend speichern
      if (keycloak.token) {
        sessionStorage.setItem('token', keycloak.token);
      }

      // Keep sessionStorage token up-to-date on auth events
      keycloak.onAuthSuccess = () => { if (keycloak.token) sessionStorage.setItem('token', keycloak.token); };
      keycloak.onAuthRefreshSuccess = () => { if (keycloak.token) sessionStorage.setItem('token', keycloak.token); };
      keycloak.onAuthLogout = () => { sessionStorage.removeItem('token'); };
      keycloak.onTokenExpired = () => {
        keycloak.updateToken(30)
          .then(() => { if (keycloak.token) sessionStorage.setItem('token', keycloak.token); })
          .catch(() => { console.warn('Token refresh failed'); });
      };

      return bootstrapApplication(App, appConfig);
    })
    .catch((err) => console.error('Keycloak init error', err));
}
