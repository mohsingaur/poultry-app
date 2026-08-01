import { CanActivateFn, Router } from '@angular/router';
import { Utility } from '../utility/data-store';

export const authGuard: CanActivateFn = (route, state) => {
  const router = new Router();
  const token = Utility.getToken();
  if (!token) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
