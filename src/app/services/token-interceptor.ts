import { HttpInterceptorFn } from '@angular/common/http';
import { Utility } from '../utility/data-store';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('login') || req.url.includes('signup')) {
    return next(req);
  }
  const token = Utility.getToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req);
};
