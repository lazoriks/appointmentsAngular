import { Component } from '@angular/core';
import { Router } from '@angular/router';

type TabKey = 'appointments' | 'services' | 'masters' | 'clients';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  active: TabKey = 'appointments';

  constructor(private router: Router) {}

  ngOnInit() {
    if (sessionStorage.getItem('admin_auth') !== 'true') {
      this.router.navigate(['/']);
    }
  }

  setTab(tab: TabKey) {
    this.active = tab;
  }

  logout() {
    sessionStorage.removeItem('admin_auth');
    this.router.navigate(['/']);
  }
}
