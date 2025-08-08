import { Component, EventEmitter, Input, Output } from '@angular/core';

type TabKey = 'appointments' | 'services' | 'masters' | 'clients';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @Input() active: TabKey = 'appointments';
  @Output() tabChange = new EventEmitter<TabKey>();
  @Output() logout = new EventEmitter<void>();

  tabs: { key: TabKey; label: string }[] = [
    { key: 'appointments', label: 'Appointments' },
    { key: 'services', label: 'Services' },
    { key: 'masters', label: 'Masters' },
    { key: 'clients', label: 'Clients' },
  ];
}
