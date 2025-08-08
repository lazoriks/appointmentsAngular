import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Master } from '../../../models/master.model';
import { ModalFormComponent, FieldConfig } from '../../modal-form/modal-form.component';

@Component({
  standalone: true,
  selector: 'app-masters-table',
  imports: [NgFor, FormsModule, ModalFormComponent],
  styleUrls: ['./masters-table.component.scss'],
  template: `
    <div class="card" style="margin-bottom:12px;">
      <button class="btn primary" (click)="openAdd()">Add Master</button>
      <button class="btn" (click)="refresh()">Refresh</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr><th>#</th><th>First Name</th><th>Surname</th><th>Email</th><th>GroupId</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let m of rows; index as i">
            <td>{{i+1}}</td>
            <td>{{m.firstName}}</td>
            <td>{{m.surname}}</td>
            <td>{{m.email || '-'}}</td>
            <td>{{m.groupServiceId || '-'}}</td>
            <td>
              <button class="btn" (click)="openEdit(m)">Edit</button>
              <button class="btn danger" (click)="del(m.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <app-modal-form
      [open]="modalOpen"
      [title]="editModel?.id ? 'Edit Master' : 'Add Master'"
      [fields]="fields"
      [model]="editModel"
      (close)="modalOpen=false"
      (save)="save($event)">
    </app-modal-form>
  `
})
export class MastersTableComponent {
  rows: Master[] = [];
  modalOpen = false;
  editModel: any = {};
  fields: FieldConfig[] = [
    { key: 'firstName', label: 'First Name', required: true },
    { key: 'surname', label: 'Surname', required: true },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'groupServiceId', label: 'Group ID', type: 'number' },
  ];

  constructor(private api: AdminService) { this.refresh(); }

  refresh() { this.api.getMasters().subscribe({ next: d => this.rows = d }); }
  openAdd() { this.editModel = {}; this.modalOpen = true; }
  openEdit(m: Master) { this.editModel = { ...m }; this.modalOpen = true; }
  save(model: any) {
    this.api.saveMaster(model).subscribe({
      next: () => { this.modalOpen = false; this.refresh(); }
    });
  }
  del(id: number) {
    if (!confirm('Delete master?')) return;
    this.api.deleteMaster(id).subscribe({ next: () => this.refresh() });
  }
}
