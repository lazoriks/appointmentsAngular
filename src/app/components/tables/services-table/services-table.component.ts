import { Component } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Service } from '../../../models/service.model';

@Component({
  selector: 'app-services-table',
  templateUrl: './services-table.component.html',
  styleUrls: ['./services-table.component.scss'],
})
export class ServicesTableComponent {
  rows: Service[] = [];
  loading = false;

  modalVisible = false;
  modalModel: any = {};
  fields = [
    { key: 'serviceName', label: 'Name' },
    { key: 'price', label: 'Price', type: 'number' },
    { key: 'period', label: 'Period (min)', type: 'number' },
    { key: 'description', label: 'Description' },
    { key: 'groupServiceId', label: 'Group ID', type: 'number' },
  ];

  constructor(private api: AdminService) {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.api.getServices().subscribe({
      next: (data) => { this.rows = data; this.loading = false; },
      error: () => { this.rows = []; this.loading = false; }
    });
  }

  openAdd() {
    this.modalModel = { serviceName: '', price: 0, period: 30, description: '', groupServiceId: 1 };
    this.modalVisible = true;
  }

  openEdit(row: Service) {
    this.modalModel = { ...row };
    this.modalVisible = true;
  }

  save(model: Service) {
    this.api.saveService(model).subscribe({
      next: () => { this.modalVisible = false; this.fetch(); }
    });
  }

  delete(row: Service) {
    if (!row.id) return;
    if (!confirm('Delete service?')) return;
    this.api.deleteService(row.id).subscribe({
      next: () => this.fetch()
    });
  }
}
