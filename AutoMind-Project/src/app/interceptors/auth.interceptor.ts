import { HttpInterceptorFn } from '@angular/common/http';
import { from } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const kc = (window as any).keycloak;

  const forwardWithToken = () => {
    const token = sessionStorage.getItem('token') || (kc && kc.token);
    const headers = token ? req.headers.set('Authorization', `Bearer ${token}`) : req.headers;
    return next(req.clone({ headers }));
  };

  if (kc && typeof kc.updateToken === 'function') {
    // updateToken returns a Promise<boolean>
    // If updateToken fails (no refresh token available), fall back to forwarding
    // the request with the existing token instead of letting the request error out.
    return from(kc.updateToken(5)).pipe(
      switchMap(() => forwardWithToken()),
      catchError((err) => {
        console.warn('Keycloak updateToken failed, proceeding with existing token', err);
        return forwardWithToken();
      })
    );
  }

  return forwardWithToken();
};
