import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav style="background:#fff;border-bottom:1px solid #eee;">
      <div class="container" style="display:flex;align-items:center;gap:16px;justify-content:space-between;">
        <div style="display:flex;gap:12px;align-items:center;">
          <a routerLink="/dashboard" class="btn">Dashboard</a>
        </div>
        <div>
          <button class="btn" (click)="logout()">Logout</button>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  constructor(private auth: AuthService, private router: Router) {}
  logout() { this.auth.logout(); }
}
