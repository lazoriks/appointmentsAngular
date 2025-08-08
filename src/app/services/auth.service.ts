import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'admin_token';
  isAuthed = signal<boolean>(!!localStorage.getItem(this.tokenKey));

  constructor(private router: Router) {}

  login(username: string, password: string): boolean {
    if (username === 'admin' && password === 'Beauty2025') {
      localStorage.setItem(this.tokenKey, 'ok');
      this.isAuthed.set(true);
      return true;
    }
    return false;
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
