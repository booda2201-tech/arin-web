import { Injectable, Injector } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { API_BASE } from './api.config';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isApiRequest(req.url) || this.isPublicRequest(req)) {
      return next.handle(req);
    }

    const auth = this.injector.get(AuthService, null);
    const token = auth?.token;
    if (!token) {
      return next.handle(req);
    }

    return next.handle(
      req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    );
  }

  /** Catalog GET stays usable anonymously, but still attach token when logged in. */
  private isPublicRequest(req: HttpRequest<unknown>): boolean {
    const path = this.pathOnly(req.url);
    const method = req.method.toUpperCase();

    if (method === 'POST') {
      if (/^\/api\/Auth\/(login|register)\b/i.test(path)) {
        return true;
      }
      if (/^\/api\/ContactMessages\/?$/i.test(path)) {
        return true;
      }
      if (/^\/api\/QuoteRequests\/?$/i.test(path)) {
        return true;
      }
      if (/^\/api\/PrivateLabelRequests\/?$/i.test(path)) {
        return true;
      }
    }

    return false;
  }

  private pathOnly(url: string): string {
    try {
      if (url.startsWith('http')) {
        return new URL(url).pathname;
      }
    } catch {
      /* ignore */
    }
    const noQuery = url.split('?')[0];
    const idx = noQuery.indexOf('/api/');
    return idx >= 0 ? noQuery.slice(idx) : noQuery;
  }

  private isApiRequest(url: string): boolean {
    if (!url.includes('/api/')) {
      return false;
    }
    if (!API_BASE) {
      return url.startsWith('/api/') || url.includes(`${window.location.origin}/api/`);
    }
    return url.startsWith(API_BASE) || url.includes('/api/');
  }
}
