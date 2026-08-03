import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'admin_key';
  isAuthed = signal<boolean>(!!localStorage.getItem(this.tokenKey));

  constructor(private http: HttpClient, private router: Router) {}

  // Exchanges username/password for the internal X-Admin-Key via the backend,
  // so managers never see or type the raw key sent on every /api/admin request.
  login(username: string, password: string): Observable<{ apiKey: string }> {
    return this.http
      .post<{ apiKey: string }>(`${environment.apiBase}/auth/login`, { username, password })
      .pipe(
        tap(res => {
          localStorage.setItem(this.tokenKey, res.apiKey);
          this.isAuthed.set(true);
        })
      );
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
