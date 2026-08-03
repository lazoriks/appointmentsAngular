import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'admin_key';
  isAuthed = signal<boolean>(!!localStorage.getItem(this.tokenKey));

  constructor(private router: Router) {}

  // Stores whatever key the user enters; the backend is the source of truth —
  // an invalid key just gets 401s from the API (see adminKeyInterceptor).
  login(adminKey: string): boolean {
    const key = adminKey.trim();
    if (!key) return false;
    localStorage.setItem(this.tokenKey, key);
    this.isAuthed.set(true);
    return true;
  }

  getAdminKey(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.isAuthed.set(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.isAuthed();
  }
}
