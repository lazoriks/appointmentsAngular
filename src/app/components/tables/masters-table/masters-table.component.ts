import { Component } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Master } from '../../../models/master.model';

@Component({
  selector: 'app-masters-table',
  templateUrl: './masters-table.component.html',
  styleUrls: ['./masters-table.component.scss'],
})
export class MastersTableComponent {
  rows: Master[] = [];
  loading = false;

  modalVisible = false;
  modalModel: any = {};
  fields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'surname', label: 'Surname' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'groupServiceId', label: 'Group ID', type: 'number' },
  ];

  constructor(private api: AdminService) {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.api.getMasters().subscribe({
      next: (data) => { this.rows = data; this.loading = false; },
      error: () => { this.rows = []; this.loading = false; }
    });
  }

  openAdd() {
    this.modalModel = { firstName: '', surname: '', email: '', groupServiceId: 1 };
    this.modalVisible = true;
  }

  openEdit(row: Master) {
    this.modalModel = { ...row };
    this.modalVisible = true;
  }

  save(model: Master) {
    this.api.saveMaster(model).subscribe({
      next: () => { this.modalVisible = false; this.fetch(); }
    });
  }

  delete(row: Master) {
    if (!row.id) return;
    if (!confirm('Delete master?')) return;
    this.api.deleteMaster(row.id).subscribe({
      next: () => this.fetch()
    });
  }
}
