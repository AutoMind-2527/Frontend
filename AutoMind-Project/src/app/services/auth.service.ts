import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare const window: any;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usernameSubject = new BehaviorSubject<string | null>(null);
  public username$ = this.usernameSubject.asObservable();

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
}
