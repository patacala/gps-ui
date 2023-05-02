import { inject, Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { SnackAlert } from '@components'
@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {
  snackAlert = inject(SnackAlert);
  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token: string | null = localStorage.getItem('token');

    let request = req;

    if (token) {
      request = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          token: `${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError(({ error }) => {
        this.snackAlert.showError(error.message)
        return throwError(() => new Error(error.err.message))
      }),
    )
  }

}