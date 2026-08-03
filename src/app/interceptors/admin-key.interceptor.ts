import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const key = auth.getAdminKey();
  const authedReq = key ? req.clone({ setHeaders: { 'X-Admin-Key': key } }) : req;

  return next(authedReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
