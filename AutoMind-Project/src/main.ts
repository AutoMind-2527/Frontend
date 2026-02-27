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
// Set to false to require real Keycloak login
const DEV_MODE = false;

if (DEV_MODE) {
  // Use mock token for development
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldiBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  sessionStorage.setItem('token', mockToken);
  bootstrapApplication(App, appConfig).catch((err) => console.error(err));
} else {
  // Start the app immediately so the homepage is shown without waiting for Keycloak.
  bootstrapApplication(App, appConfig).catch((err) => console.error(err));

  // Initialize Keycloak in the background. We use 'check-sso' so the user is not
  // redirected away automatically; login only happens when calling `keycloak.login()`.
  keycloak
    .init({
      // Do not pass `onLoad` here — that would trigger a silent SSO check which
      // can cause an automatic redirect. We initialize the adapter so `kc.login()`
      // can be called later from the UI, but we don't perform any login checks now.
      pkceMethod: 'S256',
      checkLoginIframe: false,
      // Prevent fallback redirect when silent SSO isn't supported in the browser.
      silentCheckSsoFallback: false
    })
    .then((authenticated) => {
      if (!authenticated) {
        console.warn('Not authenticated');
      }

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
    })
    .catch((err) => console.error('Keycloak init error', err));
}
