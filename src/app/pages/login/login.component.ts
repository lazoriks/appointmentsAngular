import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="container" style="max-width:420px;margin-top:10vh;">
      <div class="card">
        <h2>Admin Login</h2>
        <form (ngSubmit)="submit()">
          <label>Username</label>
          <input class="input" [(ngModel)]="username" name="username" required />
          <div style="height:10px"></div>
          <label>Password</label>
          <input class="input" [(ngModel)]="password" name="password" type="password" required />
          <div style="height:16px"></div>
          <button class="btn primary" type="submit">Login</button>
          <span *ngIf="error" style="color:#e74c3c;margin-left:12px;">{{error}}</span>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (this.auth.login(this.username, this.password)) {
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Invalid credentials';
    }
  }
}
