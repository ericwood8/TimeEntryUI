import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Sends the token with every call to the API, and sends the person back to the sign-in page when the API says it is no longer good. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
    const auth = inject(AuthService);
    const isApiCall = request.url.startsWith('api/');
    const token = auth.token;

    if (isApiCall && token) {
        request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && isApiCall && !request.url.endsWith('/auth/login')) {
                auth.logout();
            }
            return throwError(() => error);
        })
    );
};
