import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { Client } from '../../../models/client.model';

@Component({
  standalone: true,
  selector: 'app-clients-table',
  imports: [NgFor],
  styleUrls: ['./clients-table.component.scss'],
  template: `
    <div class="card" style="margin-bottom:12px;">
      <button class="btn danger" (click)="refresh()">Refresh</button>
    </div>
    <div class="card">
      <table class="table">
        <thead>
          <tr><th>#</th><th>Name</th><th>Mobile</th><th>Email</th><th>GoogleID</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of rows; index as i">
            <td>{{i+1}}</td>
            <td>{{c.firstName}} {{c.surname}}</td>
            <td>{{c.mobile}}</td>
            <td>{{c.email || '-'}}</td>
            <td>{{c.googleId || '-'}}</td>
            <td>
              <button class="btn danger" (click)="del(c.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class ClientsTableComponent {
  rows: Client[] = [];
  constructor(private api: AdminService) { this.refresh(); }
  refresh() { this.api.getClients().subscribe({ next: d => this.rows = d }); }
  del(id: number) {
    if (!confirm('Delete client?')) return;
    this.api.deleteClient(id).subscribe({ next: () => this.refresh() });
  }
}
