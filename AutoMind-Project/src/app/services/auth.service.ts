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
        kc.onAuthLogout = () => this.usernameSubject.next(null);
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
        return;
      }

      // fallback: load profile (async)
      if (typeof kc.loadUserProfile === 'function') {
        kc.loadUserProfile()
          .then((profile: any) => {
            const pName = profile?.username || (profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : null);
            this.usernameSubject.next(pName || null);
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
    // Get real token from Keycloak using password grant
    const tokenUrl = 'https://if220129.cloud.htl-leonding.ac.at/keycloak/realms/automind-realm/protocol/openid-connect/token';
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('client_id', 'automind-backend');
    body.set('username', 'trackertest');
    body.set('password', 'admin');

    return fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    })
    .then(response => response.json())
    .then(data => {
      if (data.access_token) {
        sessionStorage.setItem('token', data.access_token);
        sessionStorage.setItem('isLoggedIn', 'true');
        this.usernameSubject.next('trackertest');
        this.isLoggedInSubject.next(true);
        console.log('✅ Successfully logged in with real Keycloak token');
        return true;
      } else {
        console.error('Failed to get token:', data);
        return false;
      }
    })
    .catch(error => {
      console.error('Login error:', error);
      return false;
    });
  }

  logout(): void {
    sessionStorage.removeItem('isLoggedIn');
    this.usernameSubject.next(null);
    this.isLoggedInSubject.next(false);
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
