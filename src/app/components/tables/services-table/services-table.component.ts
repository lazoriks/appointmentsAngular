import { Component } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { ServiceModel } from '../../../models/service.model';
import { ModalFormComponent, FieldConfig } from '../../modal-form/modal-form.component';

@Component({
  standalone: true,
  selector: 'app-services-table',
  imports: [ModalFormComponent],
  styleUrls: ['./services-table.component.scss'],
  template: `
    <div class="card" style="margin-bottom:12px;">
      <button class="btn primary" (click)="openAdd()">Add Service</button>
      <button class="btn" (click)="refresh()">Refresh</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>#</th><th>Name</th><th>Price</th><th>Period</th><th>Description</th><th>GroupId</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (s of rows; track s.id) {
            <tr>
              <td>{{ rows.indexOf(s) + 1 }}</td>
              <td>{{ s.serviceName }}</td>
              <td>{{ s.price }}</td>
              <td>{{ s.period }}</td>
              <td>{{ s.description || '-' }}</td>
              <td>{{ s.groupServiceId || '-' }}</td>
              <td>
                <button class="btn" (click)="openEdit(s)">Edit</button>
                <button class="btn danger" (click)="del(s.id)">Delete</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (modalOpen) {
      <app-modal-form
        [open]="modalOpen"
        [title]="editModel.id ? 'Edit Service' : 'Add Service'"
        [fields]="fields"
        [model]="editModel"
        (close)="modalOpen=false"
        (save)="save($event)">
      </app-modal-form>
    }
  `
})
export class ServicesTableComponent {
  rows: ServiceModel[] = [];
  modalOpen = false;
  editModel: any = {};
  fields: FieldConfig[] = [
    { key: 'serviceName', label: 'Name', required: true },
    { key: 'price', label: 'Price', type: 'number', required: true },
    { key: 'period', label: 'Period (min)', type: 'number', required: true },
    { key: 'description', label: 'Description' },
    { key: 'groupServiceId', label: 'Group ID', type: 'number' },
  ];

  constructor(private api: AdminService) { this.refresh(); }

  refresh() { this.api.getServices().subscribe({ next: d => this.rows = d }); }

  openAdd() {
    console.log('openAdd called');
    this.editModel = {};
    this.modalOpen = true;
  }

  openEdit(s: ServiceModel) {
    console.log('openEdit called', s);
    this.editModel = { ...s };
    this.modalOpen = true;
  }

  save(model: any) {
    this.api.saveService(model).subscribe({
      next: () => { this.modalOpen = false; this.refresh(); }
    });
  }

  del(id: number) {
    if (!confirm('Delete service?')) return;
    this.api.deleteService(id).subscribe({ next: () => this.refresh() });
  }
}
