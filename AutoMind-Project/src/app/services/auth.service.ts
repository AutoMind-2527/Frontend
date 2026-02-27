import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare const window: any;

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
        kc.onAuthSuccess = () => this.updateFromKeycloak(kc);
        kc.onAuthLogout = () => {
          sessionStorage.removeItem('token');
          sessionStorage.setItem('isLoggedIn', 'false');
          this.usernameSubject.next(null);
          this.isLoggedInSubject.next(false);
        };
        kc.onAuthRefreshSuccess = () => this.updateFromKeycloak(kc);
      } catch (e) {
        // some keycloak builds may not expose these handlers; ignore safely
      }
    }
  }

  private checkLoginStatus(): boolean {
    const loginStatus = sessionStorage.getItem('isLoggedIn');
    return loginStatus === 'true';
  }

  private updateFromKeycloak(kc: any) {
    try {
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
      }
    } catch (e) {
      this.usernameSubject.next(null);
    }
  }

  login(): Promise<boolean> {
    const kc = (window as any).keycloak;
    if (!kc) {
      console.error('Keycloak not initialized');
      return Promise.resolve(false);
    }

    // Redirect to Keycloak login page
    kc.login({ redirectUri: `${window.location.origin}/dashboard` });
    
    // Return promise (though we're redirecting away)
    return Promise.resolve(true);
  }

  signup(): void {
    const kc = (window as any).keycloak;
    if (!kc) {
      console.error('Keycloak not initialized');
      return;
    }

    // Redirect to Keycloak registration page
    kc.register({ redirectUri: `${window.location.origin}/dashboard` });
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
