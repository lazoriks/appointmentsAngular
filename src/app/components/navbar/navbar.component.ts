import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="navbar">
      <div class="navbar-container">

        <!-- 🔹 Ліва частина -->
        <div class="navbar-left">
          <div class="brand" (click)="goHome()">
            <img src="https://glamlimerick.com/wp-content/uploads/2025/07/лого-на-фоні-1.png"
                 alt="Logo" class="logo">
            <span class="brand-name">GlamLimerick <b>Admin</b></span>
          </div>

          <!-- Кнопка бургер для мобільних -->
          <button class="burger" (click)="toggleMenu()">☰</button>
        </div>

        <!-- 🔹 Права частина (меню) -->
        <div class="navbar-right" [class.open]="menuOpen">
          <a routerLink="/dashboard" class="btn" (click)="closeMenu()">Dashboard</a>
          <button class="btn home" (click)="goHome()">🏠 Main Site</button>
          <button class="btn danger" (click)="logout()">Logout</button>
        </div>

      </div>

      <!-- 🔹 Overlay (для мобільного) -->
      <div class="overlay" *ngIf="menuOpen" (click)="closeMenu()"></div>
    </nav>
  `,
  styles: [`
    /* === Загальний стиль === */
    .navbar {
      background:#fff;
      border-bottom:1px solid #eee;
      box-shadow:0 1px 4px rgba(0,0,0,0.05);
      position:sticky;
      top:0;
      z-index:1000;
    }

    .navbar-container {
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:8px 16px;
      max-width:1200px;
      margin:0 auto;
    }

    .navbar-left {
      display:flex;
      align-items:center;
      gap:12px;
    }

    .brand {
      display:flex;
      align-items:center;
      gap:8px;
      cursor:pointer;
      user-select:none;
    }

    .logo {
      width:28px;
      height:28px;
      border-radius:50%;
    }

    .brand-name {
      font-size:16px;
      font-weight:600;
      color:#333;
      letter-spacing:0.2px;
    }

    /* === Кнопки === */
    .btn {
      border:none;
      background:#f3f3f3;
      padding:6px 12px;
      border-radius:6px;
      cursor:pointer;
      font-size:14px;
      transition:background 0.2s ease;
      margin-left:4px;
    }

    .btn:hover { background:#e8e8e8; }

    .btn.danger {
      background:#ff5252;
      color:#fff;
    }
    .btn.danger:hover { background:#e14242; }

    .btn.home {
      background:#ff7f50;
      color:#fff;
      font-weight:600;
    }
    .btn.home:hover { background:#ff6330; }

    /* === Бургер кнопка === */
    .burger {
      background:none;
      border:none;
      font-size:22px;
      cursor:pointer;
      display:none;
    }

    /* === Десктопне меню === */
    .navbar-right {
      display:flex;
      align-items:center;
      gap:8px;
    }

    /* === Мобільне меню === */
    @media (max-width: 768px) {
      .burger {
        display:block;
      }

      .navbar-right {
        position:absolute;
        top:58px;
        left:0;
        width:100%;
        flex-direction:column;
        align-items:flex-start;
        background:#fff;
        padding:12px 16px;
        box-shadow:0 4px 8px rgba(0,0,0,0.1);
        border-bottom-left-radius:10px;
        border-bottom-right-radius:10px;
        display:none;
        z-index:1001;
      }

      .navbar-right.open {
        display:flex;
        animation: fadeIn 0.25s ease;
      }

      .navbar-right .btn {
        width:100%;
        text-align:left;
        margin:4px 0;
      }

      .overlay {
        position:fixed;
        top:0;
        left:0;
        width:100vw;
        height:100vh;
        background:rgba(0,0,0,0.3);
        z-index:100;
        animation: fadeIn 0.2s ease;
      }
    }

    @keyframes fadeIn {
      from { opacity:0; transform:translateY(-5px); }
      to { opacity:1; transform:translateY(0); }
    }
  `]
})
export class NavbarComponent {
  menuOpen = false;

  constructor(private auth: AuthService, private router: Router) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  goHome() {
    window.location.href = 'https://glamlimerick.com/';
  }

  logout() {
    this.auth.logout();
  }
}
