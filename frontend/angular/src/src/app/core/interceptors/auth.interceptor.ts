import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const user = authStore.user();

  if (['login', 'register'].includes(req.url)) {
    return next(req);
  }
  if (user) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer fake-jwt-token-for-${user.id}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
