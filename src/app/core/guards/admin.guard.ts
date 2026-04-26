import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, switchMap, map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // user$ emite null mientras Firebase resuelve la sesión.
  // filter(user => user !== null) espera a que el SDK confirme el usuario real
  // antes de evaluar el rol — evita que take(1) capture el false inicial.
  return authService.user$.pipe(
    filter(user => user !== null),
    take(1),
    switchMap(() => authService.isAdmin$.pipe(take(1))),
    map(isAdmin => isAdmin ? true : router.createUrlTree(['/home']))
  );
};
