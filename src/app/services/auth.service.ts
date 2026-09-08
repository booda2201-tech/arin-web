import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
}

const STORAGE_KEY = 'arin_auth_session';

// Demo users available for authentication
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: 'u-admin-1',
    name: 'عبدالرحمن عرين',
    email: 'admin@arin.com',
    password: 'admin',
    role: 'admin',
    title: 'مدير العمليات والنظام',
  },
  {
    id: 'u-user-1',
    name: 'أحمد التاجر',
    email: 'client@arin.com',
    password: 'user123',
    role: 'user',
    title: 'شريك تجاري',
  },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(this.loadStoredUser());
  user$ = this.userSubject.asObservable();

  constructor() {}

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  get isAdmin(): boolean {
    return this.userSubject.value?.role === 'admin';
  }

  login(email: string, password: string): Observable<{ success: boolean; message?: string; user?: User }> {
    const trimmedEmail = email.trim().toLowerCase();
    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
    );

    if (!found) {
      // Check if it's an admin attempt with wrong password
      const userExists = DEMO_USERS.some((u) => u.email.toLowerCase() === trimmedEmail);
      const msg = userExists
        ? 'كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.'
        : 'البريد الإلكتروني غير مسجل، يمكنك استخدام بيانات الحسابات التجريبية.';
      return of({ success: false, message: msg }).pipe(delay(500));
    }

    const { password: _, ...user } = found;

    return of({ success: true, user }).pipe(
      delay(400),
      tap((res) => {
        if (res.user) {
          this.setSession(res.user);
        }
      })
    );
  }

  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear local storage', e);
    }
    this.userSubject.next(null);
  }

  private setSession(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Could not save user session', e);
    }
    this.userSubject.next(user);
  }

  private loadStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as User;
      }
    } catch (e) {
      console.warn('Failed to parse stored session', e);
    }
    return null;
  }
}
