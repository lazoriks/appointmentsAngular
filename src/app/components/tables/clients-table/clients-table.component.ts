import { Component } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Client } from '../../../models/client.model';

@Component({
  selector: 'app-clients-table',
  templateUrl: './clients-table.component.html',
  styleUrls: ['./clients-table.component.scss'],
})
export class ClientsTableComponent {
  rows: Client[] = [];
  loading = false;

  modalVisible = false;
  modalModel: any = {};
  fields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'surname', label: 'Surname' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'googleId', label: 'Google ID' },
  ];

  constructor(private api: AdminService) {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.api.getClients().subscribe({
      next: (data) => { this.rows = data; this.loading = false; },
      error: () => { this.rows = []; this.loading = false; }
    });
  }

  openAdd() {
    this.modalModel = { firstName: '', surname: '', mobile: '', email: '', googleId: '' };
    this.modalVisible = true;
  }

  openEdit(row: Client) {
    this.modalModel = { ...row };
    this.modalVisible = true;
  }

  save(model: Client) {
    this.api.saveClient(model).subscribe({
      next: () => { this.modalVisible = false; this.fetch(); }
    });
  }

  delete(row: Client) {
    if (!row.id) return;
    if (!confirm('Delete client?')) return;
    this.api.deleteClient(row.id).subscribe({
      next: () => this.fetch()
    });
  }
}
