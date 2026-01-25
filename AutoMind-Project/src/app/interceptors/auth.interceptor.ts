import { HttpInterceptorFn } from '@angular/common/http';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const kc = (window as any).keycloak;

  const forwardWithToken = () => {
    const token = sessionStorage.getItem('token') || (kc && kc.token);
    const headers = token ? req.headers.set('Authorization', `Bearer ${token}`) : req.headers;
    return next(req.clone({ headers }));
  };

  if (kc && typeof kc.updateToken === 'function') {
    // updateToken returns a Promise<boolean>
    return from(kc.updateToken(5)).pipe(switchMap(() => forwardWithToken()));
  }

  return forwardWithToken();
};
