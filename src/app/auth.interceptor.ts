import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = sessionStorage.getItem('token');
    const env = sessionStorage.getItem('env');

    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (env) headers['X-Environment-Id'] = env;

    const cloned = req.clone({ setHeaders: headers });
    return next.handle(cloned);
  }
}