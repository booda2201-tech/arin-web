import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { apiUrl, clearLegacyLocalStorage } from './api.config';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
}

interface AuthSession {
  token: string;
  user: User;
}

const STORAGE_KEY = 'arin_auth_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private tokenValue: string | null = null;
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    clearLegacyLocalStorage();
    this.restoreSession();
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get token(): string | null {
    return this.tokenValue;
  }

  get isLoggedIn(): boolean {
    return !!this.userSubject.value && !!this.tokenValue;
  }

  get isAdmin(): boolean {
    return this.userSubject.value?.role === 'admin';
  }

  login(email: string, password: string): Observable<{ success: boolean; message?: string; user?: User }> {
    const body = { email: email.trim(), password };

    return this.http.post<unknown>(apiUrl('/api/Auth/login'), body).pipe(
      switchMap((res) => {
        if (res && typeof res === 'object' && (res as Record<string, unknown>)['success'] === false) {
          return of({
            success: false as const,
            message: this.extractMessage(res) || 'بيانات الدخول غير صحيحة.',
          });
        }

        const token = this.extractToken(res);
        if (!token) {
          return of({
            success: false as const,
            message: this.extractMessage(res) || 'تعذر تسجيل الدخول: لم يُرجع الخادم رمز الدخول.',
          });
        }

        this.tokenValue = token;
        const partial = this.extractUser(res, email);

        return this.http.get<unknown>(apiUrl('/api/Auth/me')).pipe(
          map((me) => {
            const user = this.mergeUser(partial, me, email);
            this.setSession(token, user);
            return { success: true as const, user };
          }),
          catchError(() => {
            const user = partial || this.fallbackUser(email);
            this.setSession(token, user);
            return of({ success: true as const, user });
          })
        );
      }),
      catchError((err: HttpErrorResponse) =>
        of({
          success: false as const,
          message: this.httpErrorMessage(err),
        })
      )
    );
  }

  logout(): void {
    this.tokenValue = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    this.userSubject.next(null);
  }

  private restoreSession(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as AuthSession | User;
      // Legacy mock session had no token — drop it.
      if (!('token' in parsed) || !parsed.token) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      this.tokenValue = parsed.token;
      this.userSubject.next(parsed.user);
    } catch {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
  }

  private setSession(token: string, user: User): void {
    this.tokenValue = token;
    try {
      const session: AuthSession = { token, user };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* ignore */
    }
    this.userSubject.next(user);
  }

  private extractToken(res: unknown): string | null {
    if (!res || typeof res !== 'object') {
      return null;
    }
    const r = res as Record<string, unknown>;
    const data = (r['data'] && typeof r['data'] === 'object' ? r['data'] : r) as Record<string, unknown>;
    const candidates = [
      data['token'],
      data['accessToken'],
      data['access_token'],
      data['jwt'],
      r['token'],
      r['accessToken'],
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim()) {
        return c.trim();
      }
    }
    return null;
  }

  private extractUser(res: unknown, email: string): User | null {
    if (!res || typeof res !== 'object') {
      return null;
    }
    const r = res as Record<string, unknown>;
    const data = (r['data'] && typeof r['data'] === 'object' ? r['data'] : r) as Record<string, unknown>;
    const nested =
      data['user'] && typeof data['user'] === 'object'
        ? (data['user'] as Record<string, unknown>)
        : data;
    return this.mapUserRecord(nested, email);
  }

  private mergeUser(partial: User | null, me: unknown, email: string): User {
    if (me && typeof me === 'object') {
      const r = me as Record<string, unknown>;
      const data = (r['data'] && typeof r['data'] === 'object' ? r['data'] : r) as Record<string, unknown>;
      const mapped = this.mapUserRecord(data, email);
      if (mapped) {
        return mapped;
      }
    }
    return partial || this.fallbackUser(email);
  }

  private mapUserRecord(raw: Record<string, unknown>, emailFallback: string): User | null {
    const email =
      (typeof raw['email'] === 'string' && raw['email']) ||
      emailFallback.trim().toLowerCase();
    const name =
      (typeof raw['fullName'] === 'string' && raw['fullName']) ||
      (typeof raw['name'] === 'string' && raw['name']) ||
      (typeof raw['userName'] === 'string' && raw['userName']) ||
      email.split('@')[0];
    const id =
      (typeof raw['id'] === 'string' && raw['id']) ||
      (typeof raw['userId'] === 'string' && raw['userId']) ||
      email;

    const role = this.resolveRole(raw);
    return {
      id: String(id),
      name: String(name),
      email: String(email),
      role,
      title: typeof raw['title'] === 'string' ? raw['title'] : role === 'admin' ? 'مدير النظام' : 'مستخدم',
    };
  }

  private resolveRole(raw: Record<string, unknown>): UserRole {
    const roleVal = raw['role'] ?? raw['Role'];
    if (typeof roleVal === 'string') {
      const lower = roleVal.toLowerCase();
      if (lower.includes('admin') || lower === 'administrator') {
        return 'admin';
      }
      if (lower === 'user' || lower === 'client') {
        return 'user';
      }
    }
    const roles = raw['roles'] ?? raw['Roles'];
    if (Array.isArray(roles)) {
      const joined = roles.map((x) => String(x).toLowerCase()).join(' ');
      if (joined.includes('admin')) {
        return 'admin';
      }
    }
    // Authenticated portal users can manage the dashboard.
    return 'admin';
  }

  private fallbackUser(email: string): User {
    return {
      id: email.trim().toLowerCase(),
      name: email.split('@')[0] || 'Admin',
      email: email.trim().toLowerCase(),
      role: 'admin',
      title: 'مدير النظام',
    };
  }

  private extractMessage(res: unknown): string | null {
    if (!res || typeof res !== 'object') {
      return null;
    }
    const r = res as Record<string, unknown>;
    if (typeof r['message'] === 'string' && r['message']) {
      return r['message'];
    }
    return null;
  }

  private httpErrorMessage(err: HttpErrorResponse): string {
    const body = err.error;
    if (body && typeof body === 'object') {
      const msg = (body as Record<string, unknown>)['message'];
      if (typeof msg === 'string' && msg.trim() && !msg.includes('<')) {
        return msg;
      }
      const errors = (body as Record<string, unknown>)['errors'];
      if (Array.isArray(errors) && errors.length) {
        return errors.map(String).join(' · ');
      }
    }
    if (typeof body === 'string' && body.trim() && !body.includes('<') && !body.includes('Cannot POST')) {
      return body;
    }
    if (err.status === 0) {
      return 'تعذر الاتصال بالخادم. تحقق من الشبكة أو إعدادات CORS.';
    }
    if (err.status === 401 || err.status === 403) {
      return 'البريد أو كلمة المرور غير صحيحة.';
    }
    if (err.status === 404) {
      return 'مسار تسجيل الدخول غير موجود على الخادم. تحقق من عنوان الـ API.';
    }
    return `فشل تسجيل الدخول (${err.status || 'خطأ شبكة'}).`;
  }
}
