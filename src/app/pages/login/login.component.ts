import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // auto redirect if already logged in
    if (sessionStorage.getItem('admin_auth') === 'true') {
      this.router.navigate(['/dashboard']);
    }
  }

  login() {
    if (this.username === 'admin' && this.password === 'Beauty2025') {
      sessionStorage.setItem('admin_auth', 'true');
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Invalid credentials';
    }
  }
}
