import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const canActivateAuth: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  try {
    // якщо сервіс каже, що користувач НЕ автентифікований → перекидаємо на логін
    if (!auth.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }
    return true;
  } catch (err) {
    console.error('AuthGuard error:', err);
    router.navigate(['/login']);
    return false;
  }
};
