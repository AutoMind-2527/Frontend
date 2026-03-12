import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare const window: any;

type AuthRedirectMode = 'login' | 'register';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usernameSubject = new BehaviorSubject<string | null>(null);
  public username$ = this.usernameSubject.asObservable();
  
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.checkLoginStatus());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor() {
    const kc = (window as any).keycloak;
    if (kc) {
      // initialize from existing token/profile
      this.updateFromKeycloak(kc);

      // attach simple handlers if available
      try {
        const prevOnAuthSuccess = kc.onAuthSuccess;
        const prevOnAuthLogout = kc.onAuthLogout;
        const prevOnAuthRefreshSuccess = kc.onAuthRefreshSuccess;

        kc.onAuthSuccess = () => {
          if (typeof prevOnAuthSuccess === 'function') {
            prevOnAuthSuccess();
          }
          this.updateFromKeycloak(kc);
        };
        kc.onAuthLogout = () => {
          if (typeof prevOnAuthLogout === 'function') {
            prevOnAuthLogout();
          }
          sessionStorage.removeItem('token');
          sessionStorage.setItem('isLoggedIn', 'false');
          this.usernameSubject.next(null);
          this.isLoggedInSubject.next(false);
        };
        kc.onAuthRefreshSuccess = () => {
          if (typeof prevOnAuthRefreshSuccess === 'function') {
            prevOnAuthRefreshSuccess();
          }
          this.updateFromKeycloak(kc);
        };
      } catch (e) {
        // some keycloak builds may not expose these handlers; ignore safely
      }

      const keycloakReady = (window as any).keycloakReady;
      if (keycloakReady && typeof keycloakReady.then === 'function') {
        keycloakReady
          .then(() => this.updateFromKeycloak(kc))
          .catch((err: unknown) => {
            console.warn('Keycloak readiness check failed', err);
            this.isLoggedInSubject.next(false);
          });
      }
    }
  }

  private getRedirectUri(): string {
    return `${window.location.origin}/dashboard`;
  }

  private async waitForKeycloakReady(): Promise<any> {
    const kc = (window as any).keycloak;
    const keycloakReady = (window as any).keycloakReady;

    if (keycloakReady && typeof keycloakReady.then === 'function') {
      try {
        await keycloakReady;
      } catch (err) {
        console.warn('Proceeding with manual Keycloak redirect after init failure', err);
      }
    }

    return kc;
  }

  private async redirectToKeycloak(mode: AuthRedirectMode): Promise<boolean> {
    const action = mode === 'register' ? 'register' : 'login';
    const urlFactory = mode === 'register' ? 'createRegisterUrl' : 'createLoginUrl';

    try {
      const kc = await this.waitForKeycloakReady();
      if (!kc) {
        console.error('Keycloak not initialized');
        return false;
      }

      const redirectUri = this.getRedirectUri();
      if (typeof kc[urlFactory] === 'function') {
        const targetUrl = await kc[urlFactory]({ redirectUri });
        window.location.assign(targetUrl);
        return true;
      }

      if (typeof kc[action] === 'function') {
        await kc[action]({ redirectUri });
        return true;
      }

      console.error(`Keycloak ${action} action is not available`);
      return false;
    } catch (err) {
      console.error(`Keycloak ${action} failed`, err);
      return false;
    }
  }

  private checkLoginStatus(): boolean {
    const loginStatus = sessionStorage.getItem('isLoggedIn');
    return loginStatus === 'true';
  }

  private updateFromKeycloak(kc: any) {
    try {
      if (kc.token) {
        sessionStorage.setItem('token', kc.token);
        sessionStorage.setItem('isLoggedIn', 'true');
      }

      const parsed = kc.tokenParsed || {};
      const username = parsed.preferred_username || parsed.username || parsed.name || null;
      if (username) {
        this.usernameSubject.next(username);
        // mark as logged in
        sessionStorage.setItem('isLoggedIn', 'true');
        this.isLoggedInSubject.next(true);
        return;
      }

      // fallback: load profile (async)
      if (typeof kc.loadUserProfile === 'function') {
        kc.loadUserProfile()
          .then((profile: any) => {
            const pName = profile?.username || (profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : null);
            this.usernameSubject.next(pName || null);
            if (pName) {
              sessionStorage.setItem('isLoggedIn', 'true');
              this.isLoggedInSubject.next(true);
            }
          })
          .catch(() => this.usernameSubject.next(null));
      } else {
        this.usernameSubject.next(null);
        if (!kc.token) {
          sessionStorage.setItem('isLoggedIn', 'false');
          this.isLoggedInSubject.next(false);
        }
      }
    } catch (e) {
      this.usernameSubject.next(null);
      this.isLoggedInSubject.next(false);
    }
  }

  login(): Promise<boolean> {
    return this.redirectToKeycloak('login');
  }

  signup(): Promise<boolean> {
    return this.redirectToKeycloak('register');
  }

  logout(): void {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('token');
    this.usernameSubject.next(null);
    this.isLoggedInSubject.next(false);

    const kc = (window as any).keycloak;
    if (kc && typeof kc.logout === 'function') {
      kc.logout({ redirectUri: window.location.origin });
    }
  }

  continueAsGuest(): void {
    sessionStorage.setItem('isLoggedIn', 'false');
    this.usernameSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }
}
